import React from 'react';
import TransactionSummary from '../transactionSummary';
import votingConst from '../../constants/voting';
import {
  getTotalVotesCount,
  getVoteList,
  getUnvoteList,
  getTotalActions,
} from '../../utils/voting';
import routes from '../../constants/routes';
import Tooltip from '../toolbox/tooltip/tooltip';
import links from '../../constants/externalLinks';
import VoteUrlProcessor from '../voteUrlProcessorV2';

import styles from './votingV2.css';

const VotingSummary = ({
  t, votes, history, account, nextStep, votePlaced, voteLookupStatus,
}) => {
  const {
    maxCountOfVotes,
    fee,
  } = votingConst;
  const voteList = getVoteList(votes);
  const unvoteList = getUnvoteList(votes);
  const totalActions = getTotalActions(votes);
  return (
    <TransactionSummary
      t={t}
      account={account}
      confirmButton={{
        label: t('Confirm voting'),
        disabled: totalActions === 0 ||
          (voteLookupStatus.pending && voteLookupStatus.pending.length > 0),
        onClick: ({ secondPassphrase }) => {
          votePlaced({
            account,
            votes,
            passphrase: account.passphrase,
            secondPassphrase,
            goToNextStep: ({ success, text, errorMessage }) => {
              nextStep({
                success,
                ...(success ? {
                  title: t('Voting submitted'),
                  message: t('You will be notified when your votes are forged.'),
                  primaryButon: {
                    title: t('Back to Delegates'),
                    className: 'back-to-delegates-button',
                    onClick: () => {
                      history.push(routes.delegates.path);
                    },
                  },
                } : {
                  title: t('Voting failed'),
                  message: errorMessage || t('Oops, looks like something went wrong. Please try again.'),
                  primaryButon: {
                    title: t('Back to Voting'),
                    onClick: () => {
                      history.push(routes.delegates.path);
                    },
                  },
                  error: text,
                }),
              });
            },
          });
        },
      }}
      cancelButton={{
        label: t('Edit voting'),
        onClick: () => {
          history.push(routes.delegates.path);
        },
      }}
      title={t('Voting summary')} >
      <section>
        <label>{t('Votes after confirmation')}</label>
        <label>{getTotalVotesCount(votes)}/{maxCountOfVotes}</label>
      </section>
      <section>
        <label>
          {t('Transaction fee')}
          <Tooltip
            title={t('Transaction fee')}
            footer={
              <a href={links.transactionFee}
                rel="noopener noreferrer"
                target="_blank">
                  {t('Read More')}
              </a>
            }
          >
            <p className={styles.tooltipText}>
            {
              t(`Every transaction needs to be confirmed and forged into Lisks blockchain network. 
                  Such operations require hardware resources and because of that there is a small fee for processing those.`)
            }
            </p>
          </Tooltip>
        </label>
        <label> {fee * totalActions} LSK </label>
      </section>
      <VoteUrlProcessor
        account={account}
        votes={votes}
        voteLookupStatus={voteLookupStatus}/>
      {voteList.length > 0 ?
        <section>
          <label>{t('Added votes')} ({voteList.length})</label>
          <label>
            <div className={`${styles.votesContainer} added-votes`} >
              {voteList.map(vote => (
               <span key={vote} className={`${styles.voteTag} vote`}>
                <span className={styles.rank}>#{votes[vote].rank}</span>
                <span className={styles.username}>{vote}</span>
               </span>
              ))}
            </div>
          </label>
        </section> :
        null }
      {unvoteList.length > 0 ?
        <section>
          <label>{t('Removed votes')} ({unvoteList.length})</label>
          <label>
            <div className={`${styles.votesContainer} removed-votes`} >
              {unvoteList.map(vote => (
               <span key={vote} className={`${styles.voteTag} vote`}>
                <span className={styles.rank}>#{votes[vote].rank}</span>
                <span className={styles.username}>{vote}</span>
               </span>
              ))}
            </div>
          </label>
        </section> :
        null }
    </TransactionSummary>
  );
};

export default VotingSummary;
