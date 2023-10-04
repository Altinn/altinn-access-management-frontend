import { Alert, Chip, Heading, Paragraph } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import type { DelegationResponseData } from '@/rtk/features/singleRights/singleRightsSlice';

import classes from './ReceiptActionBarContent.module.css';

export interface ReceiptActionBarContent {
  /** List of failed delegations */
  failedDelegations: DelegationResponseData[] | undefined;

  /** List of successful delegations */
  successfulDelegations: DelegationResponseData[] | undefined;

  /** If there's http problems with the delegation */
  isRejectedDelegation: boolean | undefined;

  /** Outer index used to create unique keys */
  index: number;
}

/**
 * This component renders ActionBarContent specialized for ActionBars in ActionBarSection on ReceiptPage
 *
 * @example
 * <ReceiptActionBarContent
 * failedDelegations={failedDelegations}
 * successfulDelegations={successfulDelegations}
 * isRejectedDelegation={isRejectedDelegation}
 * index={index}
 * />
 */

export const ReceiptActionBarContent = ({
  failedDelegations,
  successfulDelegations,
  isRejectedDelegation,
  index,
}: ReceiptActionBarContent) => {
  const { t } = useTranslation();

  const dangerAlert = () => {
    return (
      <div className={classes.alertContainer}>
        {failedDelegations && failedDelegations?.length > 1 && (
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
                {failedDelegations?.map((failedRight: DelegationResponseData, innerIndex) => {
                  return (
                    <Chip.Toggle key={`failed-${index}-${innerIndex}`}>
                      {t(`common.${failedRight.action}`)}
                    </Chip.Toggle>
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
            {successfulDelegations?.map((right: DelegationResponseData, innerIndex) => {
              return (
                <Chip.Toggle
                  selected={true}
                  checkmark
                  key={`successful-${index}-${innerIndex}`}
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

  return (
    <div className={classes.content}>
      {failedDelegations && failedDelegations?.length > 1 && dangerAlert()}
      {successfulDelegations && successfulDelegations?.length > 0 && successfulChips()}
      {isRejectedDelegation && (
        <Paragraph>{t('single_rights.all_failed_techncal_problem_paragraph')}</Paragraph>
      )}
    </div>
  );
};
