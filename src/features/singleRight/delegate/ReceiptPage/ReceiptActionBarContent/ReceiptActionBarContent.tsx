import { Alert, Heading, Paragraph, Tag } from '@digdir/designsystemet-react';
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
  serviceType,
}: ReceiptActionBarContent) => {
  const { t } = useTranslation();

  const dangerAlert = () => {
    return (
      <div className={classes.alertContainer}>
        {failedDelegations && failedDelegations?.length > 1 && (
          <Alert
            color='danger'
            role='alert'
          >
            <Heading
              size={'xs'}
              level={2}
              className={classes.headerSpacing}
            >
              {t('single_rights.woops_something_went_wrong_alert')}
            </Heading>
            <Paragraph
              variant='long'
              className={classes.paragraphSpacing}
            >
              {t('single_rights.some_failed_technical_problem')}
            </Paragraph>
            <Heading
              size={'2xs'}
              level={3}
              className={classes.headerSpacing}
            >
              {t('single_rights.these_rights_were_not_delegated')}
            </Heading>
            <div className={classes.chipContainer}>
              {failedDelegations
                ?.map((failedRight: Right) => {
                  const chipText = Object.values(LocalizedAction).includes(
                    failedRight.action as LocalizedAction,
                  )
                    ? t(`common.action_${failedRight.action}`)
                    : failedRight.action;
                  return chipText;
                })
                .join(', ')}
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
          size={'2xs'}
          level={3}
        >
          {t('single_rights.these_rights_were_delegated')}
        </Heading>
        <div className={classes.chipContainer}>
          {serviceType === 'AltinnApp'
            ? t('common.action_access')
            : successfulDelegations
                ?.map((right: Right) => {
                  const chipText = Object.values(LocalizedAction).includes(
                    right.action as LocalizedAction,
                  )
                    ? t(`common.action_${right.action}`)
                    : right.action;
                  return chipText;
                })
                .join(', ')}
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
