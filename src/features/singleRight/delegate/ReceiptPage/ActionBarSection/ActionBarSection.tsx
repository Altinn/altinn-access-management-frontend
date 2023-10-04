import { useTranslation } from 'react-i18next';
import {
  Alert,
  Chip,
  ErrorMessage,
  Heading,
  Ingress,
  Paragraph,
} from '@digdir/design-system-react';
import * as React from 'react';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useState } from 'react';

import { useAppSelector } from '@/rtk/app/hooks';
import type {
  DelegationResponseData,
  ProcessedDelegation,
} from '@/rtk/features/singleRights/singleRightsSlice';
import {
  BFFDelegatedStatus,
  ReduxStatusResponse,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ReceiptActionBar } from '../ReceiptActionBar/ReceiptActionBar';
import { ReceiptActionBarContent } from '../ReceiptActionBarContent/ReceiptActionBarContent';

import classes from './ActionBarSection.module.css';

export const ActionBarSection = () => {
  const { t } = useTranslation();
  const delegations = useAppSelector((state) => state.singleRightsSlice.processedDelegations);
  const [mostFailedIndex, setMostFailedIndex] = useState(-1);
  const [mostFailedDelegations, setMostFailedDelegations] = useState(-1);

  const firstSuccesfulIndex = delegations.findIndex((pd: ProcessedDelegation) => {
    const failedDelegations = pd.bffResponseList?.filter(
      (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.Delegated,
    );
    return failedDelegations?.length === 0;
  });

  // logic for finding the delegation with the most failed Delegations
  delegations.forEach((pd: ProcessedDelegation, index) => {
    const failedDelegations = pd.bffResponseList?.filter(
      (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.Delegated,
    );

    const numFailedDelegations = failedDelegations?.length || 0;

    if (numFailedDelegations > mostFailedDelegations) {
      setMostFailedDelegations(numFailedDelegations);
      setMostFailedIndex(index);
    }
  });

  const actionBars = delegations
    .map((pd: ProcessedDelegation, index: number) => {
      const failedDelegations = pd.bffResponseList?.filter(
        (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.Delegated,
      );

      const successfulDelegations = pd.bffResponseList?.filter(
        (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.NotDelegated,
      );

      const numFailedDelegations = failedDelegations?.length || 0;

      const isRejectedDelegation = !!pd.bffResponseList?.find(
        (resp) => resp.reduxStatus === ReduxStatusResponse.Rejected,
      );

      const additionalText = () => {
        if (numFailedDelegations > 1) {
          return (
            <div className={classes.additionalTextContainer}>
              <ErrorMessage className={classes.additionalText}>
                {numFailedDelegations +
                  '/' +
                  pd.bffResponseList?.length +
                  ' ' +
                  t('common.failed_lowercase')}
              </ErrorMessage>
              <ExclamationmarkTriangleIcon className={classes.warningIcon} />
            </div>
          );
        } else if (isRejectedDelegation) {
          return (
            <div className={classes.additionalTextContainer}>
              <ErrorMessage className={classes.additionalTextRejected}>
                {t('common.failed')}
              </ErrorMessage>
              <ExclamationmarkTriangleIcon className={classes.warningIconRejected} />
            </div>
          );
        } else {
          return undefined;
        }
      };

      const failedDelegationIngress = () => {
        return (
          <Ingress
            className={classes.failedText}
            level={2}
            spacing
          >
            {t('single_rights.woops_something_went_wrong_ingress')}
          </Ingress>
        );
      };

      const successfulDelegationParagraph = () => {
        return (
          <Ingress
            className={classes.successText}
            spacing
            level={2}
          >
            {t('single_rights.has_received_these_rights', { name: 'ANNEMA FIGMA' })}
          </Ingress>
        );
      };

      return {
        actionBar: (
          <>
            {index === mostFailedIndex && failedDelegationIngress()}
            {index === firstSuccesfulIndex && successfulDelegationParagraph()}
            <ReceiptActionBar
              title={pd.meta.serviceDto.serviceTitle}
              subtitle={pd.meta.serviceDto.serviceOwner}
              additionalText={additionalText()}
              color={numFailedDelegations !== 0 ? 'danger' : 'success'}
              defaultOpen={index === mostFailedIndex && numFailedDelegations > 0}
              key={`receipt-action-bar-${index}`}
            >
              <ReceiptActionBarContent
                failedDelegations={failedDelegations}
                successfulDelegations={successfulDelegations}
                isRejectedDelegation={isRejectedDelegation}
                index={index}
              />
            </ReceiptActionBar>
          </>
        ),
        numFailedDelegations,
      };
    })
    .sort((a, b) => b.numFailedDelegations - a.numFailedDelegations)
    .map((item) => item.actionBar);

  return actionBars;
};
