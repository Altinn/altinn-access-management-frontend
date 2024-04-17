/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { Paragraph, Heading, Chip, Alert } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { ErrorCode, getErrorCodeTextKey, prioritizeErrors } from '@/resources/utils/errorCodeUtils';
import { ServiceType, type Details } from '@/rtk/features/singleRights/singleRightsSlice';
import { LocalizedAction } from '@/resources/utils/localizedActions';

import classes from './RightsActionBarContent.module.css';

export type ChipRight = {
  action: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
  details?: Details[];
};

export interface RightsActionBarContentProps {
  /** The callback function to be called when toggling a right. */
  toggleRight: (serviceIdentifier: string, action: string) => void;

  /** Callback to toggle sll delegable rights  for a service*/
  toggleAllDelegableRights: (serviceIdentifier: string) => void;

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
}

export const RightsActionBarContent = ({
  toggleRight,
  toggleAllDelegableRights,
  rights,
  serviceDescription,
  rightDescription,
  serviceIdentifier,
  serviceType,
}: RightsActionBarContentProps) => {
  const { t } = useTranslation('common');
  const hasUndelegableRights =
    rights.some((r) => r.delegable === false) && serviceType !== ServiceType.AltinnApp;
  const [errorList, setErrorList] = useState<string[]>([]);

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

  const serviceResourceContent = (
    <>
      <Paragraph>{serviceDescription}</Paragraph>
      <Paragraph>{rightDescription}</Paragraph>
      <Paragraph>{t('single_rights.action_bar_adjust_rights_text')}</Paragraph>
      <div className={classes.chipContainer}>
        {serviceType === 'AltinnApp' ? (
          <div>
            <Chip.Toggle
              size='small'
              checkmark
              selected={rights[0].checked}
              onClick={() => toggleAllDelegableRights(serviceIdentifier)}
            >
              {t('common.access')}
            </Chip.Toggle>
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
                  <Chip.Toggle
                    size='small'
                    checkmark
                    selected={right.checked}
                    onClick={() => {
                      toggleRight(serviceIdentifier, right.action);
                    }}
                  >
                    {actionText}
                  </Chip.Toggle>
                </div>
              );
            })
        )}
      </div>
    </>
  );

  const alertContainer = hasUndelegableRights && (
    <div className={classes.alertContainer}>
      <Alert severity='warning'>
        <Heading
          size={'xsmall'}
          level={4}
          spacing
        >
          {t('single_rights.alert_partially_delegable_header')}
        </Heading>
        <Paragraph spacing>
          {t('single_rights.one_or_more_rights_is_undelegable', {
            reason: t(`${getErrorCodeTextKey(errorList[0])}`, {
              you: t('common.you_lowercase'),
            }),
          })}
        </Paragraph>
        <Paragraph spacing>{t('single_rights.ceo_or_main_admin_can_help')}</Paragraph>
        <>
          <Heading
            size={'xxsmall'}
            level={5}
          >
            {t('single_rights.you_cant_delegate_these_rights')}
          </Heading>
          <div className={classes.chipContainer}>
            {rights
              .filter((right: ChipRight) => right.delegable === false)
              .map((right: ChipRight, index: number) => {
                const actionText = Object.values(LocalizedAction).includes(
                  right.action as LocalizedAction,
                )
                  ? t(`common.${right.action}`)
                  : right.action;
                return (
                  <Chip.Toggle
                    size='small'
                    key={index}
                  >
                    {actionText}
                  </Chip.Toggle>
                );
              })}
          </div>
        </>
      </Alert>
    </div>
  );

  return (
    <div className={classes.content}>
      {serviceResourceContent}
      {alertContainer}
    </div>
  );
};
