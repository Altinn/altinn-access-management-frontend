/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { Paragraph, Heading, Chip, Alert } from '@digdir/design-system-react';
import { useTranslation } from 'react-i18next';

import type { IdValuePair } from '@/dataObjects/dtos/singleRights/DelegationInputDto';
import { getSingleRightsErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';

import classes from './RightsActionBarContent.module.css';

export type Right = {
  action: string;
  delegable: boolean;
  checked: boolean;
  resourceReference: IdValuePair[];
};

enum LocalizedAction {
  Read = 'read',
  Write = 'write',
  Sign = 'sign',
  Instantiate = 'instantiate',
  Confirm = 'confirm',
  Access = 'access',
}

export interface RightsActionBarContentProps {
  /** The callback function to be called when toggling a right. */
  toggleRight: (serviceIdentifier: string, action: string) => void;

  /** List of rights to be presented as toggle chips */
  rights: Right[];

  /** Description of the service */
  serviceDescription?: string;

  /** Description of the rights */
  rightDescription?: string;

  /** Unique identifier for the service the rights adhere to */
  serviceIdentifier: string;

  /** code representing the error if service contains rights that are not delegable */
  errorCode?: string;
}

export const RightsActionBarContent = ({
  toggleRight,
  rights,
  serviceDescription,
  rightDescription,
  serviceIdentifier,
  errorCode,
}: RightsActionBarContentProps) => {
  const { t } = useTranslation('common');
  const hasUndelegableRights = rights.some((r) => r.delegable === false);

  const serviceResourceContent = (
    <>
      <Paragraph>{serviceDescription}</Paragraph>
      <Paragraph>{rightDescription}</Paragraph>
      <Paragraph>{t('single_rights.action_bar_adjust_rights_text')}</Paragraph>
      <Heading
        size={'xxsmall'}
        level={5}
      >
        {t('single_rights.choose_rights_chip_text')}
      </Heading>
      <div className={classes.chipContainer}>
        {rights
          .filter((right: Right) => right.delegable === true)
          .map((right: Right, index: number) => {
            const actionText = Object.values(LocalizedAction).includes(
              right.action as LocalizedAction,
            )
              ? t(`common.${right.action}`)
              : right.action;
            return (
              <div key={index}>
                <Chip.Toggle
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
          })}
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
        <Paragraph spacing>{t(`${getSingleRightsErrorCodeTextKey(errorCode)}`)}</Paragraph>
        <Heading
          size={'xxsmall'}
          level={5}
        >
          {t('single_rights.you_cant_delegate_these_rights')}
        </Heading>
        <div className={classes.chipContainer}>
          {rights
            .filter((right: Right) => right.delegable === false)
            .map((right: Right, index: number) => {
              const actionText = Object.values(LocalizedAction).includes(
                right.action as LocalizedAction,
              )
                ? t(`common.${right.action}`)
                : right.action;
              return (
                <div key={index}>
                  <Chip.Toggle>{actionText}</Chip.Toggle>
                </div>
              );
            })}
        </div>
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
