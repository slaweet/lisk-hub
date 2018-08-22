import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Send from './send';

const mapStateToProps = state => ({
  account: state.account,
  activePeer: state.peers.data,
  pendingTransactions: state.transactions.pending,
  followedAccounts: state.followedAccounts.accounts,
});

export default connect(mapStateToProps)(translate()(Send));
