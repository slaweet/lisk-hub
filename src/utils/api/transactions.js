import { validateAddress } from '../validators';
import { tokenMap, tokenKeys } from '../../constants/tokens';
import api from './';

// TODO these imports are temporary until api is implemented for them
import { send as ss, unconfirmedTransactions as ut } from './lsk/transactions';

export const send = ss;
export const unconfirmedTransactions = ut;

export const getTokenFromAddress = address => (
  tokenKeys.find(tokenKey => validateAddress(tokenKey, address) === 0)
);

const getTokenFromTransactionId = id => (
  (id && id.length === 64 ? tokenMap.BTC.key : tokenMap.LSK.key)
);

export const getTransactions = ({
  offset = 0,
  limit = 30,
  token,
  ...params
}) => (
  api[token || getTokenFromAddress(params.address)].transactions.getTransactions({
    offset,
    limit,
    ...params,
  })
);

export const getSingleTransaction = async ({ token, ...params }) => (
  api[token || getTokenFromTransactionId(params.id)].transactions.getSingleTransaction(params)
);

/**
 * This functions are not test it because all the purpose is just
 * pass parameters to another functions
 */
// istanbul ignore file
export const get = (token, data) => api[token].transactions.get(data);
// istanbul ignore next
export const create = (tokenType, data) => api[tokenType].transactions.create(data);
// istanbul ignore next
export const broadcast = (tokenType, transaction, networkConfig) =>
  api[tokenType].transactions.broadcast(transaction, networkConfig);

export default {
  broadcast,
  create,
  get,
  getSingleTransaction,
  getTokenFromAddress,
  getTransactions,
  send,
  unconfirmedTransactions,
};
