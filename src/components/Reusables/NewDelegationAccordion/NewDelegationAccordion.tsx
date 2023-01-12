import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  ButtonVariant,
  ButtonColor,
  Button,
} from '@altinn/altinn-design-system';
import { useState } from 'react';
import { t } from 'i18next';
import * as React from 'react';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import { Line } from '../Line/Line';

import classes from './NewDelegationAccordion.module.css';

export enum NewDelegationAccordionButtonType {
  Add = 'add',
  Remove = 'remove',
}

export interface NewDelegationAccordionProps {
  title?: string;
  subtitle?: string;
  topContentText?: string;
  bottomContentText?: string;
  textList?: string[];
  buttonType: NewDelegationAccordionButtonType;
  addRemoveClick: () => void;
}

export const NewDelegationAccordion = ({
  title = 'No info',
  subtitle = 'No info',
  topContentText,
  bottomContentText,
  textList = [''],
  buttonType,
  addRemoveClick,
}: NewDelegationAccordionProps) => {
  const [open, setOpen] = useState(false);

  const actions = (
    <>
      {buttonType === NewDelegationAccordionButtonType.Add && (
        <Button
          icon={<AddCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={addRemoveClick}
          aria-label={'soft-add'}
        ></Button>
      )}
      {buttonType === NewDelegationAccordionButtonType.Remove && (
        <Button
          icon={<MinusCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={addRemoveClick}
          aria-label={'soft-remove'}
        ></Button>
      )}
    </>
  );

  return (
    <div>
      <Accordion
        open={open}
        onClick={() => setOpen(!open)}
      >
        <AccordionHeader
          subtitle={subtitle}
          actions={actions}
        >
          {title}
        </AccordionHeader>
        <AccordionContent>
          <div className={classes.newApiAccordionContent}>
            {textList.length > 0 && (
              <div>
                <p className={classes.scopeText}>{t('api_delegation.scopes')}:</p>
                {textList.map((scope, i) => {
                  return (
                    <div
                      key={i}
                      className={classes.scopeItems}
                    >
                      {scope}
                    </div>
                  );
                })}
              </div>
            )}
            {topContentText && (
              <div>
                <div className={classes.line}>
                  <Line />
                </div>
                <p className={classes.scopeText}>{t('additional.description')}</p>
                <div className={classes.contentTexts}>{topContentText}</div>
              </div>
            )}
            {topContentText === undefined && (
              <div className={classes.contentTexts}>
                {t('api_delegation.data_retrieval_failed')}
              </div>
            )}
            {bottomContentText && (
              <div>
                <div className={classes.line}>
                  <Line />
                </div>
                <p className={classes.scopeText}>{t('additional.description')}</p>
                <div className={classes.bottomContentTexts}>{bottomContentText}</div>
              </div>
            )}
            {bottomContentText === undefined && (
              <div className={classes.contentTexts}>
                {t('api_delegation.data_retrieval_failed')}
              </div>
            )}
          </div>
        </AccordionContent>
      </Accordion>
    </div>
  );
};
