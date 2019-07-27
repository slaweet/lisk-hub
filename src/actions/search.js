/* istanbul ignore file */
// TODO delete this file
import actionTypes from '../constants/actions';
import { loadingStarted, loadingFinished } from './loading';
import { getAccount } from '../utils/api/account';
import { getDelegates, getVotes } from '../utils/api/delegates';
import { getTransactions } from '../utils/api/transactions';
import { getBlocks } from '../utils/api/blocks';
import transactionTypes from '../constants/transactionTypes';
import { tokenMap } from '../constants/tokens';
import { getAPIClient } from '../utils/api/network';

const searchDelegate = ({ publicKey, address }) =>
  async (dispatch, getState) => {
    const { settings: { token: { active } }, network } = getState();
    const liskAPIClient = getAPIClient(active, getState());
    const networkConfig = network;
    const token = tokenMap.LSK.key;
    const delegates = await getDelegates(liskAPIClient, { publicKey });
    const transactions = await getTransactions({
      token, networkConfig, address, limit: 1, type: transactionTypes.registerDelegate,
    });
    const block = await getBlocks(liskAPIClient, { generatorPublicKey: publicKey, limit: 1 });
    dispatch({
      data: {
        delegate: {
          ...delegates.data[0],
          lastBlock: (block.data[0] && block.data[0].timestamp) || '-',
          txDelegateRegister: transactions.data[0],
        },
        address,
      },
      type: actionTypes.searchDelegate,
    });
  };


// TODO remove this action and use src/utils/withData.js instead
export const fetchVotedDelegateInfo = (votes, {
  showingVotes = 30, address, offset = 0, limit = 101, filter = '',
}) =>
  // eslint-disable-next-line max-statements
  async (dispatch, getState) => {
    const { settings: { token: { active } } } = getState();
    const liskAPIClient = getAPIClient(active, getState());
    /* istanbul ignore if */
    if (!liskAPIClient) return;
    dispatch(loadingStarted(actionTypes.searchVotes));
    const delegates = await getDelegates(liskAPIClient, { limit, offset });
    const votesWithDelegateInfo = votes.map((vote) => {
      const delegate = delegates.data.find(d => d.username === vote.username) || {};
      return { ...vote, ...delegate };
    }).sort((a, b) => {
      if (!a.rank && !b.rank) return 0;
      if (!a.rank || +a.rank > +b.rank) return 1;
      return -1;
    });

    const filteredVotes = votesWithDelegateInfo.filter(vote => RegExp(filter, 'i').test(vote.username));
    const lastIndex = showingVotes > filteredVotes.length
      ? filteredVotes.length : showingVotes;
    if (filteredVotes.length && !filteredVotes[lastIndex - 1].rank) {
      dispatch(fetchVotedDelegateInfo(votesWithDelegateInfo, {
        offset: offset + limit,
        address,
        showingVotes,
        filter,
      }));
    } else {
      dispatch({
        type: actionTypes.searchVotes,
        data: { votes: votesWithDelegateInfo, address },
      });
      dispatch(loadingFinished(actionTypes.searchVotes));
    }
  };

const searchVotes = ({ address }) =>
  async (dispatch, getState) => {
    const { settings: { token: { active } } } = getState();
    const liskAPIClient = getAPIClient(active, getState());
    /* istanbul ignore if */
    if (!liskAPIClient) return;
    dispatch(loadingStarted(actionTypes.searchVotes));
    const votes = await getVotes(liskAPIClient, { address })
      .then(res => res.data.votes || [])
      .catch(() => dispatch(loadingFinished(actionTypes.searchVotes)));

    dispatch({
      type: actionTypes.searchVotes,
      data: { votes, address },
    });
    dispatch(loadingFinished(actionTypes.searchVotes));
  };

// TODO remove this action and use src/utils/withData.js instead
export const searchAccount = ({ address }) =>
  (dispatch, getState) => {
    const networkConfig = getState().network;
    /* istanbul ignore else */
    if (networkConfig) {
      getAccount({ networkConfig, address }).then((response) => {
        const accountData = {
          ...response,
        };
        if (accountData.delegate && accountData.delegate.username) {
          searchDelegate({ publicKey: accountData.publicKey, address })(dispatch, getState);
        }
        dispatch({ data: accountData, type: actionTypes.searchAccount });
        if (accountData.token === tokenMap.LSK.key) {
          searchVotes({ address })(dispatch, getState);
        }
      });
    }
  };
  