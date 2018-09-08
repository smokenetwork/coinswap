const queryString = require('query-string');
let steemjs_ecc = require('smoke-js/lib/auth/ecc');
let chainLib = require('smoke-js');
// chainLib.api.setOptions({url: 'https://beta.whaleshares.net/ws'});
// chainLib.config.set('address_prefix', 'WLS');
// chainLib.config.set('chain_id', 'de999ada2ff7ed3d3d580381f229b40b5a0261aec48eb830e540080817b72866');

export const actionShowMessage              = (message)         => ({ type: 'M_SHOW_MSG', message });
export const actionSetCheckUsernameLoading  = (isLoading)       => ({ type: 'M_SET_CHECK_USERNAME_LOADING', isLoading });
export const actionSetUsernameResult        = (result)          => ({ type: 'M_SET_USERNAME_RESULT', result });
export const actionSetPassword              = (password)        => ({ type: 'M_SET_PASSWORD', password });
export const actionSetPrivateKeys           = (pks)             => ({ type: 'M_SET_PRIVATE_KEYS', pks });
export const actionSetPublicKeys            = (pks)             => ({ type: 'M_SET_PUBLIC_KEYS', pks });
export const actionSetMemo                  = (memo)            => ({ type: 'M_SET_MEMO', memo });

// export const actionAddTx = (txid) => ({ type: 'M_TX_ADD', txid });
// export const actionSetTx = (item) => ({ type: 'M_TX_SET', item });
// export const actionSetTxLoading = (isLoading) => ({ type: 'M_TX_LOADING_SET', isLoading });


export const Action_CheckAvailable_Name = (username, toExitingAccount) => async (dispatch, getState) => {
    try {
        dispatch(actionShowMessage({display: false, type: 'info', content: ''}));
        dispatch(actionSetCheckUsernameLoading(true));
        dispatch(actionSetUsernameResult(''));


        // validate account name first
        let isValidUsername = chainLib.utils.validateAccountName(username);
        if (isValidUsername) {
            throw new Error(isValidUsername);
        }

        let existingAccs = await chainLib.api.getAccountsAsync([username]);


        if (toExitingAccount) {
            if (existingAccs.length <= 0) {
                throw new Error('Account Name does not exist on Smoke blockchain.');
            }
        } else {
            if (existingAccs.length > 0) {
                // this account exist
                throw new Error('Account Name exists on Smoke blockchain.');
            }
        }

        dispatch(actionSetUsernameResult('success'));

    } catch(e) {
        // console.error(e);
        dispatch(actionShowMessage({display: true, type: 'error', content: e.message}));
        dispatch(actionSetUsernameResult('error'));
    } finally {
        dispatch(actionSetCheckUsernameLoading(false));
    }
};

export const Action_Generate_Keys = (username) => async (dispatch, getState) => {
    try {
        dispatch(actionShowMessage({display: false, type: 'info', content: ''}));

        const password = 'P' + steemjs_ecc.key_utils.get_random_key().toWif();
        const private_keys = ['owner', 'active', 'posting', 'memo'].map(role => {
            const pk = steemjs_ecc.PrivateKey.fromSeed(`${username}${role}${password}`);
            return pk.toString();
        });
        const public_keys = private_keys.map(wif => {
            const pk = steemjs_ecc.PrivateKey.fromWif(wif);
            return pk.toPublicKey().toString();
        });

        // console.log(`password: ${password}`);
        // console.log(`private_keys: ${JSON.stringify(private_keys)}`);
        // console.log(`public_keys: ${JSON.stringify(public_keys)}`);

        dispatch(actionSetPassword(password));
        dispatch(actionSetPrivateKeys({ owner: private_keys[0], active: private_keys[1], posting: private_keys[2], memo: private_keys[3]}));
        dispatch(actionSetPublicKeys({ owner: public_keys[0], active: public_keys[1], posting: public_keys[2], memo: public_keys[3]}));
    } catch(e) {
        // console.error(e);
        dispatch(actionShowMessage({display: true, type: 'error', content: e.message}));
    } finally {

    }
};

export const Action_ShowMemo = (username, toExitingAccount) => async (dispatch, getState) => {
    try {
        dispatch(actionShowMessage({display: false, type: 'info', content: ''}));

        let state = await getState();
        let { public_keys } = state.AppReducer;

        let params = {};
        if (username) {
            params.u = username;
        } else {
            dispatch(actionSetUsernameResult('error'));
            throw new Error('Account name invalid!');
        }

        params.e = toExitingAccount ? 1 : 0;

        if (!toExitingAccount) {
            if (public_keys.owner) {
                params.o = public_keys.owner;
            } else {
                throw new Error('keys invalid!');
            }
            if (public_keys.active) {
                params.a = public_keys.active;
            } else {
                throw new Error('keys invalid!');
            }
            if (public_keys.posting) {
                params.p = public_keys.posting;
            } else {
                throw new Error('keys invalid!');
            }
            if (public_keys.memo) {
                params.m = public_keys.memo;
            } else {
                throw new Error('keys invalid!');
            }
        }

        let claim_memo = `claim`;
        let params_str = queryString.stringify(params);
        if (params_str) {
            claim_memo += `?${params_str}`;
        }
        // console.log(claim_memo);

        dispatch(actionSetMemo(claim_memo));
    } catch(e) {
        dispatch(actionShowMessage({display: true, type: 'error', content: e.message}));
    } finally {

    }
};