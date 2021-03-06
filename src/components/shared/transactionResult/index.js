/* eslint-disable complexity */
import React from 'react';
import { PrimaryButton, TertiaryButton } from '../../toolbox/buttons/button';
import { getErrorReportMailto } from '../../../utils/helpers';
import styles from './transactionResult.css';
import Illustration from '../../toolbox/illustration';

const TransactionResult = ({
  success, title, message, primaryButon, t, error, children, illustration, className, sharedData,
}) => {
  if (sharedData) {
    illustration = sharedData.illustration;
    title = sharedData.title;
    primaryButon = sharedData.primaryButon;
    message = sharedData.message;
    success = sharedData.success;
  }
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {
      typeof illustration === 'string'
        ? <Illustration name={illustration} />
        : React.cloneElement(illustration)
    }
      <h1 className="result-box-header">{title}</h1>
      <p className="transaction-status body-message">{message}</p>
      {children}
      <PrimaryButton
        onClick={primaryButon.onClick}
        className={`${styles.button} ${primaryButon.className}`}
      >
        {primaryButon.title}
      </PrimaryButton>
      {
      !success
        ? (
          <React.Fragment>
            <p>{t('Does the problem still persist?')}</p>
            <a
              className="report-error-link"
              href={getErrorReportMailto(error)}
              target="_top"
              rel="noopener noreferrer"
            >
              <TertiaryButton>
                {t('Report the error via E-Mail')}
              </TertiaryButton>
            </a>
          </React.Fragment>
        )
        : null
    }
    </div>
  );
};

export default TransactionResult;
