import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { useState, useEffect } from 'react';
import cn from 'classnames';
import { DsParagraph, DsValidationMessage } from '@altinn/altinn-components';

import { ReceiptActionBarContent } from '../ReceiptActionBarContent/ReceiptActionBarContent';

import classes from './ActionBarSection.module.css';

import { useAppSelector } from '@/rtk/app/hooks';
import type { Right, ProcessedDelegation } from '@/rtk/features/singleRights/singleRightsSlice';
import {
  BFFDelegatedStatus,
  ReduxStatusResponse,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { ActionBar } from '@/components';

type ActionBarSectionProps = {
  recipientName: string;
};

export const ActionBarSection = ({ recipientName }: ActionBarSectionProps) => {
  const { t } = useTranslation();
  const delegations = useAppSelector((state) => state.singleRightsSlice.processedDelegations);
  const [mostFailedIndex, setMostFailedIndex] = useState(-1);
  const [mostFailedDelegations, setMostFailedDelegations] = useState(-1);
  const [hasSuccessfullDelegations, setHasSuccessfullDelegations] = useState(false);

  const firstSuccesfulIndex = delegations.findIndex((pd: ProcessedDelegation) => {
    const failedDelegations = pd.bffResponseList?.filter(
      (data: Right) => data.status !== BFFDelegatedStatus.Delegated,
    );
    return failedDelegations?.length === 0;
  });

  // logic for finding the delegation with the most failed Delegations
  useEffect(() => {
    let currentMostFailedDelegations = mostFailedDelegations;
    let currentMostFailedIndex = mostFailedIndex;
    delegations.forEach((pd: ProcessedDelegation, index) => {
      const failedDelegations = pd.bffResponseList?.filter(
        (data: Right) => data.status !== BFFDelegatedStatus.Delegated,
      );

      const numFailedDelegations = failedDelegations?.length || 0;

      if (numFailedDelegations > currentMostFailedDelegations) {
        currentMostFailedIndex = index;
        currentMostFailedDelegations = numFailedDelegations;
      }
    });
    setMostFailedDelegations(currentMostFailedDelegations);
    setMostFailedIndex(currentMostFailedIndex);
  }, []);

  const actionBars = delegations
    .map((pd: ProcessedDelegation, index: number) => {
      const failedDelegations = pd.bffResponseList?.filter(
        (data: Right) => data.status !== BFFDelegatedStatus.Delegated,
      );

      const successfulDelegations = pd.bffResponseList?.filter(
        (data: Right) => data.status !== BFFDelegatedStatus.NotDelegated,
      );

      if (!hasSuccessfullDelegations && successfulDelegations && successfulDelegations.length > 0) {
        setHasSuccessfullDelegations(true);
      }

      const numFailedDelegations = failedDelegations?.length ?? 0;

      // if there are more than one failed delegations, we want to show the failed delegations
      const isRejectedDelegation = !!pd.bffResponseList?.find(
        (resp) => resp.reduxStatus === ReduxStatusResponse.Rejected,
      );

      const additionalText = () => {
        if (numFailedDelegations > 1) {
          return (
            <div className={classes.additionalTextContainer}>
              <DsValidationMessage
                //TODO check if this is the correct value for this component if its actually an Alert ?
                data-color='danger'
                className={classes.additionalText}
              >
                {numFailedDelegations +
                  '/' +
                  pd.bffResponseList?.length +
                  ' ' +
                  t('common.failed_lowercase')}
                <ExclamationmarkTriangleIcon className={classes.warningIcon} />
              </DsValidationMessage>
            </div>
          );
        } else if (isRejectedDelegation) {
          return (
            <div className={classes.additionalTextContainer}>
              <DsValidationMessage
                data-color='danger'
                className={classes.additionalTextRejected}
              >
                {t('common.failed')}
                <ExclamationmarkTriangleIcon className={classes.warningIconRejected} />
              </DsValidationMessage>
            </div>
          );
        } else {
          return undefined;
        }
      };

      const failedDelegationIngress = () => {
        return (
          <DsParagraph
            variant='long'
            className={classes.failedText}
          >
            {t('single_rights.woops_something_went_wrong_ingress')}
          </DsParagraph>
        );
      };

      const successfulDelegationParagraph = (extraSpacing: boolean) => {
        return (
          <DsParagraph
            variant='long'
            className={cn(extraSpacing && classes.successText)}
          >
            {t('single_rights.has_received_these_rights', { name: recipientName })}
          </DsParagraph>
        );
      };

      return {
        actionBar: (
          <div key={`receipt-action-bar-${index}`}>
            {index === mostFailedIndex && mostFailedDelegations > 0 && failedDelegationIngress()}
            {index === firstSuccesfulIndex &&
              successfulDelegationParagraph(mostFailedDelegations > 0)}
            <ActionBar
              title={pd.meta.serviceDto.serviceTitle}
              subtitle={pd.meta.serviceDto.serviceOwner}
              additionalText={additionalText()}
              color={numFailedDelegations !== 0 ? 'danger' : 'success'}
              defaultOpen={index === mostFailedIndex && numFailedDelegations > 0}
            >
              <ReceiptActionBarContent
                failedDelegations={failedDelegations}
                successfulDelegations={successfulDelegations}
                isRejectedDelegation={isRejectedDelegation}
                index={index}
                serviceType={pd.meta.serviceDto.serviceType}
              />
            </ActionBar>
          </div>
        ),
        numFailedDelegations,
      };
    })
    .sort((a, b) => b.numFailedDelegations - a.numFailedDelegations)
    .map((item) => item.actionBar);

  return (
    <>
      {actionBars}
      {hasSuccessfullDelegations && (
        <DsParagraph variant='long'>
          {t('single_rights.rights_are_valid_until_deletion')}
        </DsParagraph>
      )}
    </>
  );
};
