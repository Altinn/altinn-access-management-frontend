/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import { Paragraph, Heading, Chip, Alert } from '@digdir/design-system-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import type { IdValuePair } from '@/dataObjects/dtos/singleRights/DelegationInputDto';
import {
  ErrorCode,
  getSingleRightsErrorCodeTextKey,
  prioritizeErrors,
} from '@/resources/utils/errorCodeUtils';
import { type Details } from '@/rtk/features/singleRights/singleRightsSlice';

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

  /** List of rights to be presented as toggle chips */
  rights: ChipRight[];

  /** Description of the service */
  serviceDescription?: string;

  /** Description of the rights */
  rightDescription?: string;

  /** Unique identifier for the service the rights adhere to */
  serviceIdentifier: string;
}

export const RightsActionBarContent = ({
  toggleRight,
  rights,
  serviceDescription,
  rightDescription,
  serviceIdentifier,
}: RightsActionBarContentProps) => {
  const { t } = useTranslation('common');
  const hasUndelegableRights = rights.some((r) => r.delegable === false);
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
      <Heading
        size={'xxsmall'}
        level={5}
      >
        {t('single_rights.choose_rights_chip_text')}
      </Heading>
      <div className={classes.chipContainer}>
        {rights
          .filter((right: ChipRight) => right.delegable === true)
          .map((right: ChipRight, index: number) => {
            return (
              <div key={index}>
                <Chip.Toggle
                  checkmark
                  selected={right.checked}
                  onClick={() => {
                    toggleRight(serviceIdentifier, right.action);
                  }}
                >
                  {t(`common.${right.action}`)}
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
        <Paragraph spacing>
          {t('single_rights.one_or_more_rights_is_undelegable', {
            reason: t(`${getSingleRightsErrorCodeTextKey(errorList[0])}`, {
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
            {rights.map((right, index) => {
              if (right.delegable === false) {
                return <Chip.Toggle key={index}>{t(`common.${right.action}`)}</Chip.Toggle>;
              }
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
