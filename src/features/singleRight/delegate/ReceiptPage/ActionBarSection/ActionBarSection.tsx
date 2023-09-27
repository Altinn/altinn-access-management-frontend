import { useTranslation } from 'react-i18next';
import { Alert, Chip, ErrorMessage, Heading, Paragraph } from '@digdir/design-system-react';
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
  let firstFailedDelegationIndex = -1;

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

      const isFirstDelegationWithNoFailures = index === firstSuccesfulIndex;

      if (
        numFailedDelegations > 0 &&
        (firstFailedDelegationIndex === -1 || numFailedDelegations > firstFailedDelegationIndex)
      ) {
        // Update firstFailedDelegationIndex if this delegation has more failures
        firstFailedDelegationIndex = numFailedDelegations;
      }

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

      const receivedRightsParagraph = () => {
        return (
          <Paragraph
            className={classes.successText}
            spacing
          >
            {t('single_rights.has_received_these_rights', { name: 'ANNEMA FIGMA' })}
          </Paragraph>
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
            <div
              className={classes.chipContainer}
              key={index}
            >
              {successfulDelegations?.map((right) => {
                return (
                  <Chip.Group
                    size='small'
                    key={index}
                  >
                    <Chip.Toggle
                      selected={true}
                      checkmark
                    >
                      {t(`common.${right.action}`)}
                    </Chip.Toggle>
                  </Chip.Group>
                );
              })}
            </div>
          </div>
        );
      };

      return {
        actionBar: (
          <>
            {index === firstSuccesfulIndex && receivedRightsParagraph}
            <ReceiptActionBar
              key={index}
              title={pd.meta.serviceDto.serviceTitle}
              subtitle={pd.meta.serviceDto.serviceOwner}
              additionalText={additionalText()}
              color={numFailedDelegations === 0 ? 'success' : 'danger'}
              defaultOpen={firstFailedDelegationIndex === numFailedDelegations}
            >
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
                    <Paragraph spacing>
                      {t('single_rights.some_failed_technical_problem')}
                    </Paragraph>
                    <Heading
                      size={'xxsmall'}
                      level={3}
                    >
                      {t('single_rights.these_rights_were_not_delegated')}
                    </Heading>
                    <div
                      className={classes.chipContainer}
                      key={index}
                    >
                      {failedDelegations?.map((failedRight, index) => {
                        return (
                          <Chip.Group
                            size='small'
                            key={index}
                          >
                            <Chip.Toggle>{t(`common.${failedRight.action}`)}</Chip.Toggle>
                          </Chip.Group>
                        );
                      })}
                    </div>
                  </Alert>
                )}
              </div>
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
