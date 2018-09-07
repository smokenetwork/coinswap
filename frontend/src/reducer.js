import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import Immutable from "immutable";

const getInitialState = () => {
    let initialState = {
        message: {
            display: false,
            type: 'info',
            content: ''
        },
        ///////////////////////////////
        // for username
        loadingCheckUsername: false, // for show progress when user clicks Check Account name available
        username_result: '', // empty or error or success
        ///////////////////////////////
        // for keys
        public_keys: {
            owner: '',
            active: '',
            posting: '',
            memo: ''
        },
        password: '',
        private_keys: {
            owner: '',
            active: '',
            posting: '',
            memo: ''
        },
        memo: '' // this is memo of the claiming tx, not memo key
    };

    return initialState;
};

export const AppReducer = (state = getInitialState(), action) => {
    let immState = Immutable.fromJS(state); // converting to an immutable object
    switch (action.type) {
        case 'M_SHOW_MSG':
            return immState.set('message', action.message).toJS();

        case 'M_SET_CHECK_USERNAME_LOADING':
            return immState.set('loadingCheckUsername', action.isLoading).toJS();

        case 'M_SET_USERNAME_RESULT':
            return immState.set('username_result', action.result).toJS();

        case 'M_SET_PASSWORD':
            return immState.set('password', action.password).toJS();

        case 'M_SET_PRIVATE_KEYS':
            return immState.set('private_keys', action.pks).toJS();

        case 'M_SET_PUBLIC_KEYS':
            return immState.set('public_keys', action.pks).toJS();

        case 'M_SET_MEMO':
            return immState.set('memo', action.memo).toJS();

        default:
            return immState.toJS();
    }
};

export const rootReducer = combineReducers({
    AppReducer
});

export function configureStore(initialState = {}) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const store = createStore( rootReducer, initialState, composeEnhancers(applyMiddleware(thunk)));
    return store;
};

export const store = configureStore();