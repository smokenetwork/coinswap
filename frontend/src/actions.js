const queryString = require('query-string');
let chainLib = require('smoke-js');
chainLib.api.setOptions({url: 'https://rpc.smoke.io/'});
chainLib.config.set('address_prefix', 'SMK');
chainLib.config.set('chain_id', '1ce08345e61cd3bf91673a47fc507e7ed01550dab841fd9cdb0ab66ef576aaf0');

export const actionShowMessage              = (message)         => ({ type: 'M_SHOW_MSG', message });
export const actionSetCheckUsernameLoading  = (isLoading)       => ({ type: 'M_SET_CHECK_USERNAME_LOADING', isLoading });
export const actionSetUsernameResult        = (result)          => ({ type: 'M_SET_USERNAME_RESULT', result });
export const actionSetMemo                  = (memo)            => ({ type: 'M_SET_MEMO', memo });

export const Action_CheckAccountName = (username) => async (dispatch, getState) => {
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


        if (existingAccs.length <= 0) {
            throw new Error('Account Name does not exist on Smoke blockchain.');
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

export const Action_ShowMemo = (username) => async (dispatch, getState) => {
    try {
        dispatch(actionShowMessage({display: false, type: 'info', content: ''}));

        // let state = await getState();

        let params = {};
        if (username) {
            params.u = username;
        } else {
            dispatch(actionSetUsernameResult('error'));
            throw new Error('Account name invalid!');
        }

        let claim_memo = `swap`;
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