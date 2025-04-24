import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './ReceiptActionBarContent.module.css';

import type { Right } from '@/rtk/features/singleRights/singleRightsSlice';
import { LocalizedAction } from '@/resources/utils/localizedActions';

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
          <DsAlert
            data-color='danger'
            role='alert'
          >
            <DsHeading
              data-size={'xs'}
              level={2}
              className={classes.headerSpacing}
            >
              {t('single_rights.woops_something_went_wrong_alert')}
            </DsHeading>
            <DsParagraph
              variant='long'
              className={classes.paragraphSpacing}
            >
              {t('single_rights.some_failed_technical_problem')}
            </DsParagraph>
            <DsHeading
              data-size={'2xs'}
              level={3}
              className={classes.headerSpacing}
            >
              {t('single_rights.these_rights_were_not_delegated')}
            </DsHeading>
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
          </DsAlert>
        )}
      </div>
    );
  };

  const successfulChips = () => {
    return (
      <div className={classes.successfulChipsContainer}>
        <DsHeading
          data-size={'2xs'}
          level={3}
        >
          {t('single_rights.these_rights_were_delegated')}
        </DsHeading>
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
        <DsParagraph>{t('single_rights.all_failed_techncal_problem_paragraph')}</DsParagraph>
      )}
    </div>
  );
};
