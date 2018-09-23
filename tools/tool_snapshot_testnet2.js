/**
 * Snapshot testnet 2 to mainnet.
 */

let config = require('config.json')('./config.json');

const mysql = require('mysql2/promise');
let connection = null;

let dynamicGlobalProperties = null;

let chainLib = require('smoke-js');
chainLib.api.setOptions({url: 'ws://192.168.1.25:8090'});
chainLib.config.set('address_prefix', 'SMK');
chainLib.config.set('chain_id', '1ce08345e61cd3bf91673a47fc507e7ed01550dab841fd9cdb0ab66ef576aaf0');
// smoke testnet2 id: a66e00caa50e6817bbe24e927bf48c5d4ba1b33f36bdbb5fa262a04012c4e3ee
// smoke mainnet id: 1ce08345e61cd3bf91673a47fc507e7ed01550dab841fd9cdb0ab66ef576aaf0

const IGNORED_ACCOUNTS = [
    "initminer", "initminer1", "initminer2", "initminer3", "initminer4", "initminer5", "initminer6", "initminer7", "initminer8", "initminer9", "initminer10",
    "initminer11", "initminer12", "initminer13", "initminer14", "initminer15", "initminer16", "initminer17", "initminer18", "initminer19", "initminer20", "initminer21",
    "smoke", "miners", "null", "temp"];


getConnection = function () {
    return mysql.createConnection(config.mysql);
};

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

processAccount = async (accountName) => {
    console.log("taskProcessAccount: ", accountName);

    if (IGNORED_ACCOUNTS.indexOf(accountName) >= 0 ) {
        console.log("ignore");
        return;
    }

    let accounts = await chainLib.api.getAccountsAsync([accountName]);
    let account = accounts[0];
    // console.log(JSON.stringify(account));

    let balance = parseFloat(account.balance);
    // let power = chainLib.formatter.vestToSteem(account.vesting_shares, dynamicGlobalProperties.total_vesting_shares, dynamicGlobalProperties.total_vesting_fund_steem);
    let power = 0;
    let ownerKey = account.owner.key_auths[0][0];
    let activeKey = account.active.key_auths[0][0];
    let postingKey = account.posting.key_auths[0][0];
    let memoKey = account.memo_key;

    console.log(`ownerKey=${ownerKey}, activeKey=${activeKey}, postingKey=${postingKey}, memoKey=${memoKey}, balance=${balance}, power=${power}`);

    //
    let [dbres, dberr] = await connection.execute("INSERT tbl_account(username, ownerkey, activekey, postingkey, memokey, balance, power) VALUES(?, ?, ?, ?, ?, ?, ?)",
        [accountName, ownerKey, activeKey, postingKey, memoKey, balance, power]);
    if (dberr) {
        throw dberr;
    }

    await sleep(1000);
};

taskSnapshotAccounts = async () => {
    console.log("taskSnapshotAccounts");
    // let accountCount = await chainLib.api.getAccountCountAsync();
    // console.log("accountCount: ", accountCount);

    dynamicGlobalProperties = await chainLib.api.getDynamicGlobalPropertiesAsync();
    // console.log(JSON.stringify(dgp));

    //
    connection = await getConnection();

    //
    let [dbres, dberr] = await connection.execute("DELETE FROM tbl_account", []);
    if (dberr) {
        throw dberr;
    }

    await sleep(1000);

    try {
        let lowerBoundName = "";
        while (true) {
            let accounts = await chainLib.api.lookupAccountsAsync(lowerBoundName, 10);
            if (lowerBoundName === accounts[0]) {
                accounts.shift();
            }
            if (accounts.length <= 0) {
                break;
            }

            // console.log(JSON.stringify(accounts));
            for (accountName of accounts) {
                await processAccount(accountName);
            }

            //
            lowerBoundName = accounts.slice(-1).pop();
            await sleep(1000);
        }
    } catch(err) {
        console.log(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////

processCreateAccount = async (accountName, owner_pubkey, active_pubkey, posting_pubkey, memo_pubkey, balance, power) => {
    console.log(`processCreateAccount: ${accountName}`)

    let fee = 4.2;
    if (power > fee) {
        fee = power;
    }

    ////////////////
    // Processing Creating account
    let operations = [];
    operations.push(["account_create",
        {
            "fee": `${fee.toFixed(3)} SMOKE`, // config.fee,
            "creator": config.creater,
            "new_account_name": accountName,
            "owner": {
                "weight_threshold": 1,
                "account_auths": [],
                "key_auths": [[owner_pubkey, 1]]
            },
            "active": {
                "weight_threshold": 1,
                "account_auths": [],
                "key_auths": [[active_pubkey, 1]]
            },
            "posting": {
                "weight_threshold": 1,
                "account_auths": [],
                "key_auths": [[posting_pubkey, 1]]
            },
            "memo_key": memo_pubkey,
            "json_metadata": ""
        }
    ]);

    if (balance >= 0.001) {
        // transfer fund
        operations.push([
            "transfer",
            {
                "from": config.creater,
                "to": accountName,
                "amount": balance.toFixed(3) + ' SMOKE',
                "memo" : "snapshot"
            }
        ]);

        // if (power > 0) {
        //     operations.push([
        //         "transfer_to_vesting",
        //         {
        //             "from": config.creater,
        //             "to": accountName,
        //             "amount": power.toFixed(3) + ' SMOKE'
        //         }
        //     ]);
        // }
    }


    await chainLib.broadcast.sendAsync({operations, extensions: []}, {"active": config.activekey});
};

taskCreateAccounts = async () => {
    connection = await getConnection();

    try {
        let [rows, fields]  = await connection.execute("SELECT * FROM tbl_account", []);
        // console.log(JSON.stringify(rows));

        for (const row of rows) {
            let accountName = row.username;
            let owner_pubkey = row.ownerkey;
            let active_pubkey = row.activekey;
            let posting_pubkey = row.postingkey;
            let memo_pubkey = row.memokey;
            let balance = row.balance;
            let power = row.power;

            await processCreateAccount(accountName, owner_pubkey, active_pubkey, posting_pubkey, memo_pubkey, balance, power);

            await sleep(10000);
        }
    } catch(err) {
        console.log(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////

taskRemoveAuth = async () => {
    connection = await getConnection();

    let operations = [];

    try {
        let [rows, fields]  = await connection.execute("SELECT * FROM tbl_account", []);
        // console.log(JSON.stringify(rows));

        for (const row of rows) {
            let accountName = row.username;
            let owner_pubkey = row.ownerkey;
            let active_pubkey = row.activekey;
            let posting_pubkey = row.postingkey;
            let memo_pubkey = row.memokey;

            operations.push(["account_update",
                {
                    account: accountName,
                    owner: {
                        "weight_threshold": 1,
                        "account_auths": [],
                        "key_auths": [[owner_pubkey, 1]]
                    },
                    active: {
                        "weight_threshold": 1,
                        "account_auths": [],
                        "key_auths": [[active_pubkey, 1]]
                    },
                    posting: {
                        "weight_threshold": 1,
                        "account_auths": [],
                        "key_auths": [[posting_pubkey, 1]]
                    },
                    "memo_key": memo_pubkey,
                    "json_metadata": ""
                }
            ]);

            if (operations.length > 10) {
                await chainLib.broadcast.sendAsync({operations, extensions: []}, {"active": config.testnet2_activekey});
                operations = [];
            }
        }

        if (operations.length > 0) {
            await chainLib.broadcast.sendAsync({operations, extensions: []}, {"active": config.testnet2_activekey});
        }
    } catch(err) {
        console.log(err);
    } finally {
        await connection.end();
        process.exit(0);
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////
// taskSnapshotAccounts();
taskCreateAccounts();
// taskRemoveAuth();

