import { getTransactions, getSingleTransaction } from './transactions';
import networks from '../../constants/networks';
import { getAPIClient } from './lsk/network';

jest.mock('./lsk/network');

describe('Utils: Transactions API', () => {
  const id = '124701289470';
  const amount = '100000';
  const recipientId = '123L';
  const networkConfig = {
    name: networks.mainnet.name,
    networks: {
      LSK: {},
    },
  };
  let liskAPIClient;

  beforeEach(() => {
    liskAPIClient = {
      transactions: {
        get: jest.fn(),
        broadcast: jest.fn(),
      },
      node: {
        getTransactions: jest.fn(),
      },
    };
    liskAPIClient.transactions.broadcast.mockResolvedValue({ recipientId, amount, id });
    liskAPIClient.node.getTransactions.mockResolvedValue({ data: [] });

    getAPIClient.mockReturnValue(liskAPIClient);
  });

  describe('getTransactions', () => {
    it('should resolve getTransactions for specific token (BTC, LSK, ...) based on the address format ', async () => {
      const params = {
        address: recipientId,
        networkConfig,
      };
      liskAPIClient.transactions.get.mockResolvedValue({ data: [] });
      await getTransactions(params);
      expect(liskAPIClient.transactions.get).toHaveBeenCalledWith(expect.objectContaining({
        senderIdOrRecipientId: recipientId,
      }));
    });
  });

  describe('getSingleTransaction', () => {
    it('should resolve getSingleTransaction for specific token (BTC, LSK, ...) based on the address format ', async () => {
      const params = {
        id,
        networkConfig,
      };
      liskAPIClient.transactions.get.mockResolvedValue({ data: [] });
      await getSingleTransaction(params);
      expect(liskAPIClient.transactions.get).toHaveBeenCalledWith(expect.objectContaining({
        id,
      }));
    });
  });
});
