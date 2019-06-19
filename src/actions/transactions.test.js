import actionTypes from '../constants/actions';
import txFilters from './../constants/transactionFilters';
import {
  sent,
  loadTransactions,
  loadSingleTransaction,
  updateTransactions,
} from './transactions';
import * as transactionsApi from '../utils/api/transactions';
import * as delegateApi from '../utils/api/delegates';
import accounts from '../../test/constants/accounts';
import Fees from '../constants/fees';
import { toRawLsk } from '../utils/lsk';

jest.mock('../utils/api/transactions');
jest.mock('../utils/api/delegates');

describe('actions: transactions', () => {
  const dispatch = jest.fn();
  let getState = () => ({
    peers: { liskAPIClient: {} },
    transactions: {
      filters: {
        direction: txFilters.all,
      },
    },
  });

  describe('updateTransactions', () => {
    const data = {
      address: '15626650747375562521',
      limit: 20,
      offset: 0,
      filters: { direction: txFilters.all },
    };
    const actionFunction = updateTransactions(data);

    it('should dispatch updateTransactions action if resolved', async () => {
      transactionsApi.getTransactions.mockResolvedValue({ data: [], meta: { count: '0' } });
      const expectedAction = {
        count: 0,
        confirmed: [],
      };

      await actionFunction(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith({
        data: expectedAction,
        type: actionTypes.updateTransactions,
      });
    });
  });

  describe('loadTransactions', () => {
    const data = {
      address: '15626650747375562521L',
      limit: 20,
      offset: 0,
      filters: { direction: txFilters.all },
    };
    const actionFunction = loadTransactions(data);

    it('should create an action function', () => {
      expect(typeof actionFunction).toBe('function');
    });

    it('should dispatch transactionsLoaded action if resolved', async () => {
      transactionsApi.getTransactions.mockResolvedValue({ data: [], meta: { count: '0' } });
      const expectedAction = {
        count: 0,
        confirmed: [],
        address: data.address,
        filters: data.filters,
      };

      await actionFunction(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith({
        data: expectedAction, type: actionTypes.transactionsLoaded,
      });
    });
  });

  describe('loadSingleTransaction', () => {
    const data = {
      address: '15626650747375562521',
      limit: 20,
      offset: 0,
      filters: {
        direction: txFilters.all,
      },
    };
    const actionFunction = loadSingleTransaction(data);

    beforeEach(() => {
      getState = () => ({
        peers: {
          options: {
            code: 0,
          },
          liskAPIClient: {
            options: {
              name: 'Mainnet',
            },
          },
        },
        transactions: {
          filters: {
            direction: txFilters.all,
          },
        },
      });
    });

    it('should create an action function', () => {
      expect(typeof actionFunction).toBe('function');
    });

    it('should dispatch one transactionAddDelegateName action when transaction contains one vote added', async () => {
      const transactionResponse = {
        asset: {
          votes: [`+${accounts.delegate.publicKey}`],
        },
      };
      const delegateResponse = { username: 'peterpan' };
      const expectedActionPayload = {
        delegate: delegateResponse,
        voteArrayName: 'added',
      };
      transactionsApi.getSingleTransaction.mockResolvedValue({ data: [transactionResponse] });
      delegateApi.getDelegates.mockResolvedValue({ data: [delegateResponse] });

      await actionFunction(dispatch, getState);
      // the following timeout ensures that the async code inside `actionFunction `
      // is called before the next assertion
      await setTimeout(() => {});
      expect(dispatch).toHaveBeenCalledWith({
        data: transactionResponse, type: actionTypes.transactionLoaded,
      });
      expect(dispatch).toHaveBeenCalledWith({
        data: expectedActionPayload, type: actionTypes.transactionAddDelegateName,
      });
    });

    it('should dispatch one transactionAddDelegateName action when transaction contains one vote deleted', async () => {
      const delegateResponse = { username: 'peterpan' };
      const transactionResponse = {
        asset: {
          votes: [`-${accounts.delegate.publicKey}`],
        },
      };
      transactionsApi.getSingleTransaction.mockResolvedValue({ data: [transactionResponse] });
      delegateApi.getDelegates.mockResolvedValue({ data: [delegateResponse] });
      const expectedActionPayload = {
        delegate: delegateResponse,
        voteArrayName: 'deleted',
      };

      await actionFunction(dispatch, getState);
      // the following timeout ensures that the async code inside `actionFunction `
      // is called before the next assertion
      await setTimeout(() => {});
      expect(dispatch).toHaveBeenCalledWith({
        data: transactionResponse, type: actionTypes.transactionLoaded,
      });
      expect(dispatch).toHaveBeenCalledWith({
        data: expectedActionPayload, type: actionTypes.transactionAddDelegateName,
      });
    });
  });

  describe('sent', () => {
    const data = {
      recipientId: '15833198055097037957L',
      amount: 100,
      passphrase: 'sample passphrase',
      secondPassphrase: null,
      dynamicFeePerByte: null, // for BTC
      fee: null, // for BTC
      account: {
        info: {
          LSK: {
            publicKey: 'test_public-key',
            address: 'test_address',
          },
        },
        loginType: 0,
      },
      data: 'abc',
    };

    const actionFunction = sent(data);

    beforeEach(() => {
      getState = () => ({
        peers: { liskAPIClient: {} },
        transactions: { filter: txFilters.all },
        network: { liskAPIClient: {} },
        settings: {
          token: {
            active: 'LSK',
          },
        },
        account: data.account,
      });
    });

    it('should create an action function', () => {
      expect(typeof actionFunction).toBe('function');
    });

    it('should dispatch addPendingTransaction action if resolved', async () => {
      transactionsApi.send.mockResolvedValue({ id: '15626650747375562521' });
      const expectedAction = {
        id: '15626650747375562521',
        senderPublicKey: 'test_public-key',
        senderId: 'test_address',
        recipientId: data.recipientId,
        amount: toRawLsk(data.amount),
        fee: Fees.send,
        asset: { data: undefined },
        type: 0,
        token: 'LSK',
      };

      transactionsApi.create.mockReturnValue(expectedAction);
      transactionsApi.broadcast.mockReturnValue(expectedAction);

      await actionFunction(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith({
        data: data.passphrase, type: actionTypes.passphraseUsed,
      });
    });

    it('should dispatch transactionFailed action if caught', async () => {
      transactionsApi.create.mockImplementation(() => {
        throw new Error('sample message');
      });

      const expectedAction = {
        data: {
          errorMessage: 'sample message.',
        },
        type: actionTypes.transactionFailed,
      };

      await actionFunction(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch transactionFailed action if caught but no message returned', async () => {
      const errorMessage = 'An error occurred while creating the transaction';
      transactionsApi.create.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const expectedErrorMessage = errorMessage + '.'; // eslint-disable-line
      const expectedAction = {
        data: {
          errorMessage: expectedErrorMessage,
        },
        type: actionTypes.transactionFailed,
      };

      await actionFunction(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(expectedAction);
    });
  });
});
