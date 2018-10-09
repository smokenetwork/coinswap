let config = require('config.json')('./config.cronjob.json');
let fetch = require("node-fetch");
const queryString = require('query-string');

let chainLib = require('smoke-js');
chainLib.api.setOptions({url: 'https://internal.rpc2.wls.services'});
chainLib.config.set('address_prefix', 'SMK');
chainLib.config.set('chain_id', '1ce08345e61cd3bf91673a47fc507e7ed01550dab841fd9cdb0ab66ef576aaf0');


let {ChainStore, PrivateKey, PublicKey, Aes} = require("bitsharesjs");
let { Apis, ChainConfig } = require('bitsharesjs-ws');

const mysql = require('mysql2/promise');


const KEY_STATE_STOP = 'stop';
let stop = "1.11.0";
let last_irreversible_block_num = 0;

job_scan = async () => {
    console.log('job_scan_claim......');
    try {
        // await Apis.instance(config.bts_rpc_url, true).init_promise;
        ChainConfig.expire_in_secs = 100;
        ChainConfig.setPrefix(ChainConfig.networks.BitShares.address_prefix);
        ChainConfig.setChainId(ChainConfig.networks.BitShares.chain_id);
        ChainConfig.core_asset=ChainConfig.networks.BitShares.core_asset;

        while (true) { // loop forever
            await taskProcess();
            await sleep(60000);
        }
    } catch(err) {
        console.log(err.message);
    }
};

taskProcess = async () => {
    let connection = await get_connection();

    try {
        stop = await load_last_state(connection);
        last_irreversible_block_num = await get_last_irreversible_block_num();
        const txs = await get_account_history_operations();

        let i = txs.length - 1;
        for (; i >= 0; i--) {
            let tx = txs[i];
            await processTx(connection, tx);
        }
    } catch(err) {
        console.log(err.message);
    } finally {
        await connection.end();
    }
};

processTx = async (connection, tx) => {
    console.log(JSON.stringify(tx));
    const op = tx.op[1];

    if (tx.block_num > last_irreversible_block_num) {
        return;
    }

    if (op.to !== config.bts_tracking_account_id) {
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    if (op.amount.asset_id !== "1.3.1567") { // SMOKE
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    let swap_amount_from = op.amount.amount;
    if (swap_amount_from < 1000) { // min amount is 1.000 SMOKE = 1000 ( 3 decimals)
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    let swap_amount_to = swap_amount_from / 1000;

    const memo = op.memo;
    // console.log(memo.message);
    if (typeof memo === 'undefined') {
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    let memo_plain = null;
    try {
        memo_plain = Aes.decrypt_with_checksum(PrivateKey.fromWif(config.bts_memo_key), PublicKey.fromPublicKeyString(memo.from), memo.nonce, memo.message);
        memo_plain = String.fromCharCode.apply(null, memo_plain);
        console.log(memo_plain);
    } catch(err) {
        console.log(err.message);
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    if ((!memo_plain.startsWith('swap'))) {
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    let amount = swap_amount_to.toFixed(3) + ' SMOKE';
    const parsed = queryString.parseUrl(memo_plain).query;

    // validate account name
    let isValidUsername = chainLib.utils.validateAccountName(parsed.u);
    if (isValidUsername) {
        // throw new Error(isValidUsername);
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    // check user existing on smoke chain
    let existingAccs = await chainLib.api.getAccountsAsync([parsed.u]);
    if (existingAccs.length <= 0) {
        // this account does not exist, ignore
        stop = tx.id;
        await save_last_state(connection);
        return;
    }

    // check if this tx_id processed then ignored
    const [rows, fields] = await connection.execute('SELECT * from tbl_tx where bts_tx_id=?', [tx.id]);
    if (rows.length > 0) {
        // if (rows[0].swap_status > 0) {
            stop = tx.id;
            await save_last_state(connection);
            return;
        // }
    }

    ////////////////////////////////////////
    // update to db
    const bts_user_id = op.from;
    let [dbres, dberr] = await connection.execute("INSERT tbl_tx(bts_tx_id, bts_user_id, bts_block_num, amount, swap_status, smk_user) VALUES (?, ?, ?, ?, ?, ?)",
        [tx.id, bts_user_id, tx.block_num, swap_amount_to, 1, parsed.u]);
    if (dberr) {
        throw dberr;
    }

    ////////////////
    // Process transfering
    let operations = [];
    operations.push([
        "transfer",
        {
            "from": config.smk_acc,
            "to": parsed.u,
            "amount": amount,
            "memo": ""
        }
    ]);

    const tx_smoke = await chainLib.broadcast.sendAsync({operations, extensions: []}, {"active": config.smk_active_key});
    console.log(tx_smoke);

    //////////
    stop = tx.id;
    await save_last_state(connection);

    // update transfer tx
    try {
        let [dbres, dberr] = await connection.execute("UPDATE tbl_tx SET smk_tx_id=?, smk_block_num=? WHERE bts_tx_id=?",
            [tx_smoke.id, tx_smoke.block_num, tx.id]);
        if (dberr) {
            throw dberr;
        }
    } catch(err) {
        console.log(err.message);
    }
};

get_account_history_operations = async () => {
    // const accountHistory = await Apis.instance().history_api().exec('get_account_history_operations', [config.bts_tracking_account_id, 0, "1.11.0", stop, 100]);
    const accountHistory = await fetch(config.bts_rpc_url, {
        method: 'POST',
        body: `{"id": 1, "jsonrpc": "2.0", "method": "call", "params": ["history", "get_account_history_operations", ["${config.bts_tracking_account_id}", 0, "1.11.0", "${stop}", 100]]}`,
        headers: { 'Content-Type': 'application/json' }
    });
    const accountHistory_json = await accountHistory.json();
    // console.log(JSON.stringify(accountHistory_json));

    const txs = accountHistory_json.result;
    return txs;
};

get_last_irreversible_block_num = async () => {
    const req_dynamic_global_properties = await fetch(config.bts_rpc_url, {
        method: 'POST',
        body: `{"id": 1, "jsonrpc": "2.0", "method": "call", "params": [0, "get_dynamic_global_properties", []]}`,
        headers: { 'Content-Type': 'application/json' }
    });
    const json_dynamic_global_properties = await req_dynamic_global_properties.json();
    // console.log(JSON.stringify(json_dynamic_global_properties));

    const last_irreversible_block_num = json_dynamic_global_properties.last_irreversible_block_num;

    return last_irreversible_block_num;
};

sleep = (millis) => {
    return new Promise(resolve => setTimeout(resolve, millis));
};

save_last_state = async (connection) => {
    // step X. Save last state to db
    let [dbres, dberr] = await connection.execute("UPDATE cronjob SET datavalue=? WHERE datakey=?", [stop, KEY_STATE_STOP]);
    if (dberr) {
        throw dberr;
    }
};

load_last_state = async (connection) => {
    // step 1. Loading last state from db
    const [rows, fields] = await connection.execute('SELECT * from cronjob where datakey=?', [KEY_STATE_STOP]);
    if (rows.length > 0) {
        stop = rows[0].datavalue;
    } else {
        // insert new here
        let [dbres, dberr] = await connection.execute("INSERT `cronjob` VALUES (?, ?)", [KEY_STATE_STOP, stop]);
        if (dberr) {
            throw dberr;
        }
    }

    console.log("stop=" + stop);
    return stop;
};

// // eg 2018-06-03T15:29:33.000
// convert_utc_to_unixtime = (utc_str) => {
//     return Math.floor(new Date(utc_str).getTime()/1000);
// };

get_connection = function () {
    return mysql.createConnection(config.mysql);
};


job_scan();
