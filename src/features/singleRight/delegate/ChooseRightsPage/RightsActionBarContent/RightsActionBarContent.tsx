/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { DsAlert, DsChip, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './RightsActionBarContent.module.css';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { ErrorCode, getErrorCodeTextKey, prioritizeErrors } from '@/resources/utils/errorCodeUtils';
import { type Details } from '@/rtk/features/singleRights/singleRightsSlice';
import { LocalizedAction } from '@/resources/utils/localizedActions';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
  details?: Details[];
};

export interface RightsActionBarContentProps {
  /** The callback function to be called when toggling a right. */
  toggleRight: (serviceIdentifier: string, action: string) => void;

  /** List of rights to be presented as toggle chips */
  rights: ChipRight[];

  /** Description of the service */
  serviceDescription?: string;

  /** Description of the rights */
  rightDescription?: string;

  /** Unique identifier for the service the rights adhere to */
  serviceIdentifier: string;

  /** The type of service */
  serviceType: string;

  /** Owner of the service */
  serviceOwner: string;

  /** The reportee on which to delegate on behalf od */
  reportee: string;
}

export const RightsActionBarContent = ({
  toggleRight,
  rights,
  serviceDescription,
  rightDescription,
  serviceIdentifier,
  serviceType,
  serviceOwner,
  reportee,
}: RightsActionBarContentProps) => {
  const { t } = useTranslation();
  const hasUndelegableRights =
    rights.some((r) => r.delegable === false) && serviceType !== 'AltinnApp';
  const [errorList, setErrorList] = useState<string[]>([]);
  const [altinnAppAccess, setAltinnAppAccess] = useState(true);

  const createErrorList = () => {
    const errors: string[] = [];
    rights.forEach((right: ChipRight) => {
      if (right.delegable === false) {
        right.details?.forEach((detail) => {
          if (
            Object.values(ErrorCode).includes(detail.code as ErrorCode) &&
            detail.code !== undefined
          ) {
            errors.push(detail.code);
          }
        });
      }
    });
    setErrorList(prioritizeErrors(errors));
  };

  useEffect(() => {
    createErrorList();
  }, [rights]);

  const toggleAllDelegableRights = () => {
    rights.forEach((right: ChipRight) => {
      if (right.delegable) {
        toggleRight(serviceIdentifier, right.rightKey);
      }
    });
    setAltinnAppAccess(!altinnAppAccess);
  };

  const serviceResourceContent = (
    <>
      <DsParagraph>{serviceDescription}</DsParagraph>
      <DsParagraph>{rightDescription}</DsParagraph>
      <DsParagraph>{t('single_rights.action_bar_adjust_rights_text')}</DsParagraph>
      <div className={classes.chipContainer}>
        {serviceType === 'AltinnApp' ? (
          <div>
            <DsChip.Checkbox
              data-size='sm'
              checked={altinnAppAccess}
              onClick={toggleAllDelegableRights}
            >
              {t('common.action_access')}
            </DsChip.Checkbox>
          </div>
        ) : (
          rights
            .filter((right: ChipRight) => right.delegable === true)
            .map((right: ChipRight, index: number) => {
              const actionText = Object.values(LocalizedAction).includes(
                right.action as LocalizedAction,
              )
                ? t(`common.action_${right.action}`)
                : right.action;
              return (
                <div key={index}>
                  <Chip.Checkbox
                    data-size='sm'
                    checked={right.checked}
                    onClick={() => {
                      toggleRight(serviceIdentifier, right.rightKey);
                    }}
                  >
                    {actionText}
                  </Chip.Checkbox>
                </div>
              );
            })
        )}
      </div>
    </>
  );

  const alertContainer = hasUndelegableRights && (
    <div className={classes.alertContainer}>
      <DsAlert data-color='warning'>
        <DsHeading
          data-size={'xs'}
          level={4}
          className={classes.alertHeader}
        >
          {t('single_rights.alert_partially_delegable_header')}
        </DsHeading>
        <DsParagraph>
          {t('single_rights.one_or_more_rights_is_undelegable', {
            reason: t(`${getErrorCodeTextKey(errorList[0])}`, {
              you: t('common.you_lowercase'),
              resourceowner: serviceOwner,
              reporteeorg: reportee,
            }),
          })}
        </DsParagraph>
        {errorList[0] === ErrorCode.MissingRoleAccess ||
          (errorList[0] === ErrorCode.MissingDelegationAccess && (
            <DsParagraph>{t('single_rights.ceo_or_main_admin_can_help')}</DsParagraph>
          ))}

        <DsHeading
          className={classes.undelegableRightsHeader}
          data-size='2xs'
          level={5}
        >
          {t('single_rights.you_cant_delegate_these_rights')}
        </DsHeading>
        <div className={classes.chipContainer}>
          {rights
            .filter((right: ChipRight) => right.delegable === false)
            .map((right: ChipRight) => {
              const actionText = Object.values(LocalizedAction).includes(
                right.action as LocalizedAction,
              )
                ? t(`common.action_${right.action}`)
                : right.action;
              return actionText;
            })
            .join(', ')}
        </div>
      </DsAlert>
    </div>
  );

  return (
    <div className={classes.content}>
      {serviceResourceContent}
      {alertContainer}
    </div>
  );
};
