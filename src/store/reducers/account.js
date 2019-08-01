import actionTypes from '../../constants/actions';
import { lockDuration } from '../../constants/account';

/**
 *
 * @param {Array} state
 * @param {Object} action
 */
// eslint-disable-next-line complexity
const account = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.removePassphrase:
      return { ...state, passphrase: null, expireTime: 0 };
    case actionTypes.accountUpdated:
      return action.data.token ? {
        ...state,
        info: {
          ...(state.info || {}),
          [action.data.token]: {
            ...((state.info && state.info[action.data.token]) || {}),
            ...action.data,
          },
        },
      } : {
        ...state,
        ...action.data,
      };
    case actionTypes.passphraseUsed:
      return { ...state, expireTime: Date.now() + lockDuration };
    case actionTypes.accountLoggedIn:
      return {
        ...action.data,
        votes: state.votes,
        isDelegate: ('delegate' in action.data), // TODO remove as no longer used
      };
    case actionTypes.accountLoggedOut:
      return {
        afterLogout: true,
      };
    case actionTypes.accountLoading:
      return {
        loading: true,
      };
    // TODO Remove. Not used anymore.
    case actionTypes.accountAddVotes:
      return { ...state, votes: action.votes };
    default:
      return state;
  }
};

export default account;
