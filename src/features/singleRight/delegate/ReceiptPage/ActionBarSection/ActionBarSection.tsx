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

import { useAppSelector } from '@/rtk/app/hooks';
import type {
  DelegationResponseData,
  ProcessedDelegation,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { BFFDelegatedStatus } from '@/rtk/features/singleRights/singleRightsSlice';

import { ReceiptActionBar } from '../ReceiptActionBar/ReceiptActionBar';

import classes from './ActionBarSection.module.css';

export const ActionBarSection = () => {
  const { t } = useTranslation();
  const delegations = useAppSelector((state) => state.singleRightsSlice.processedDelegations);

  const firstFailedIndex = delegations.findIndex((pd: ProcessedDelegation) => {
    const successfulDelegations = pd.bffResponseList?.filter(
      (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.NotDelegated,
    );
    return successfulDelegations?.length === 0;
  });

  const firstSuccesfulIndex = delegations.findIndex((pd: ProcessedDelegation) => {
    const failedDelegations = pd.bffResponseList?.filter(
      (data: DelegationResponseData) => data.status !== BFFDelegatedStatus.Delegated,
    );
    return failedDelegations?.length === 0;
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

      /*       if (
        numFailedDelegations > 0 &&
        (firstFailedDelegationIndex === -1 || numFailedDelegations > firstFailedDelegationIndex)
      ) {
        firstFailedDelegationIndex = numFailedDelegations;
      } */

      const additionalText = () => {
        if (numFailedDelegations > 0) {
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
        } else {
          return undefined;
        }
      };

      const dangerAlert = () => {
        return (
          <div className={classes.alertContainer}>
            {numFailedDelegations > 0 && (
              <Alert severity='danger'>
                <Heading
                  size={'xsmall'}
                  level={2}
                  spacing
                >
                  {t('single_rights.woops_something_went_wrong_alert')}
                </Heading>
                <Paragraph spacing>{t('single_rights.some_failed_technical_problem')}</Paragraph>
                <Heading
                  size={'xxsmall'}
                  level={3}
                >
                  {t('single_rights.these_rights_were_not_delegated')}
                </Heading>
                <div className={classes.chipContainer}>
                  <Chip.Group size='small'>
                    {failedDelegations?.map((failedRight, index) => {
                      return (
                        <Chip.Toggle key={index}>{t(`common.${failedRight.action}`)}</Chip.Toggle>
                      );
                    })}
                  </Chip.Group>
                </div>
              </Alert>
            )}
          </div>
        );
      };

      const successfulChips = () => {
        return (
          <div className={classes.successfulChipsContainer}>
            <Heading
              size={'xxsmall'}
              level={3}
            >
              {t('single_rights.these_rights_were_delegated')}
            </Heading>
            <div className={classes.chipContainer}>
              <Chip.Group size='small'>
                {successfulDelegations?.map((right, index) => {
                  return (
                    <Chip.Toggle
                      selected={true}
                      checkmark
                      key={index}
                    >
                      {t(`common.${right.action}`)}
                    </Chip.Toggle>
                  );
                })}
              </Chip.Group>
            </div>
          </div>
        );
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
            {index === firstFailedIndex && failedDelegationIngress()}
            {index === firstSuccesfulIndex && successfulDelegationParagraph()}
            <ReceiptActionBar
              key={pd.meta.Rights[0].Resource[0].value}
              title={pd.meta.serviceDto.serviceTitle}
              subtitle={pd.meta.serviceDto.serviceOwner}
              additionalText={additionalText()}
              color={numFailedDelegations === 0 ? 'success' : 'danger'}
              defaultOpen={index === firstFailedIndex}
            >
              {dangerAlert()}
              {successfulDelegations?.length > 0 && successfulChips()}
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
