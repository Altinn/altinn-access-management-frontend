import { Alert, Chip, Heading, Paragraph } from '@digdir/designsystemet-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import type { Right } from '@/rtk/features/singleRights/singleRightsSlice';
import { LocalizedAction } from '@/resources/utils/localizedActions';

import classes from './ReceiptActionBarContent.module.css';

export interface ReceiptActionBarContent {
  /** List of failed delegations */
  failedDelegations: Right[] | undefined;

  /** List of successful delegations */
  successfulDelegations: Right[] | undefined;

  /** If there's http problems with the delegation */
  isRejectedDelegation: boolean | undefined;

  /** Outer index used to create unique keys */
  index: number;

  /** The type of service */
  serviceType: string;
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
  serviceType,
}: ReceiptActionBarContent) => {
  const { t } = useTranslation();

  const dangerAlert = () => {
    return (
      <div className={classes.alertContainer}>
        {failedDelegations && failedDelegations?.length > 1 && (
          <Alert
            severity='danger'
            role='alert'
          >
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
                {failedDelegations?.map((failedRight: Right, innerIndex) => {
                  const chipText = Object.values(LocalizedAction).includes(
                    failedRight.action as LocalizedAction,
                  )
                    ? t(`common.action_${failedRight.action}`)
                    : failedRight.action;
                  return (
                    <Chip.Toggle key={`failed-${index}-${innerIndex}`}>{chipText}</Chip.Toggle>
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
            {serviceType === 'AltinnApp' ? (
              <Chip.Toggle
                selected={true}
                checkmark
              >
                {t('common.action_access')}
              </Chip.Toggle>
            ) : (
              successfulDelegations?.map((right: Right, innerIndex) => {
                const chipText = Object.values(LocalizedAction).includes(
                  right.action as LocalizedAction,
                )
                  ? t(`common.action_${right.action}`)
                  : right.action;
                return (
                  <Chip.Toggle
                    selected={true}
                    checkmark
                    key={`successful-${index}-${innerIndex}`}
                  >
                    {chipText}
                  </Chip.Toggle>
                );
              })
            )}
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
