/* istanbul ignore file */
import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Blocks from './blocks';
import liskService from '../../../../utils/api/lsk/liskService';
import withData from '../../../../utils/withData';
import NotAvailable from '../notAvailable';


const BlocksMonitor = () => {
  const network = useSelector(state => state.network);

  return (
    network.name === 'Custom Node'
      ? <NotAvailable />
      : (compose(
        withRouter,
        withData({
          blocks: {
            apiUtil: liskService.getLastBlocks,
            defaultData: [],
            autoload: true,
            transformResponse: (response, oldData, urlSearchParams) => (
              urlSearchParams.offset
                ? [...oldData, ...response.filter(block =>
                  !oldData.find(({ id }) => id === block.id))]
                : response
            ),
          },
        }),
        withTranslation(),
      )(Blocks))
  );
};

export default BlocksMonitor;
