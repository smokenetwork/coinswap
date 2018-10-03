let config = require('config.json')('./config.checkmemo.json');
// let fetch = require("node-fetch");

let {ChainStore, PrivateKey, PublicKey, Aes} = require("bitsharesjs");
let { Apis, ChainConfig } = require('bitsharesjs-ws');


task_check_memo = async () => {
  console.log('task_check_memo......');
  try {
    // await Apis.instance(config.bts_rpc_url, true).init_promise;
    ChainConfig.expire_in_secs = 100;
    ChainConfig.setPrefix(ChainConfig.networks.BitShares.address_prefix);
    ChainConfig.setChainId(ChainConfig.networks.BitShares.chain_id);
    ChainConfig.core_asset=ChainConfig.networks.BitShares.core_asset;


    const memo = {
      from:	"BTS6x6WUUjHeiR3v8gD9hBakjn17wa6TDgPW3nEHuSAhFy9JBFhhJ",
      to: "BTS73Xug7ycyhn5mPRjvv6F9sKDu3UWeMo2cCgW8LTB35M7b5wnqZ",
      nonce:	"393857969908210",
      message: "6792caf0dfb56c5e8e7adf42be8223bf"
    };

    let memo_plain = null;
    try {
      memo_plain = Aes.decrypt_with_checksum(PrivateKey.fromWif(config.bts_memo_key), PublicKey.fromPublicKeyString(memo.from), memo.nonce, memo.message);
      memo_plain = String.fromCharCode.apply(null, memo_plain);
      console.log(memo_plain);

      const hex_str = Buffer.from(memo_plain).toString('hex');
      console.log(hex_str);
    } catch(err) {
      console.log(err.message);
      stop = tx.id;
      await save_last_state(connection);
      return;
    }

  } catch(err) {
    console.log(err.message);
  }
};



task_check_memo();