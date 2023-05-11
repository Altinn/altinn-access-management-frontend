import { Button } from '@digdir/design-system-react';
import { useState } from 'react';
import { t } from 'i18next';
import * as React from 'react';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import { Line } from '../Line';
import { ActionBar, type ActionBarProps } from '../ActionBar';

import classes from './DelegationActionBar.module.css';

export interface DelegationActionBarProps extends Pick<ActionBarProps, 'color'> {
  title?: string;
  subtitle?: string;
  topContentText?: string;
  bottomContentText?: string;
  textList?: string[];
  buttonType: 'add' | 'remove';
  onActionButtonClick: () => void;
}

export const DelegationActionBar = ({
  title = 'No info',
  subtitle = 'No info',
  topContentText,
  bottomContentText,
  textList = [''],
  buttonType,
  onActionButtonClick,
  color = 'neutral',
}: DelegationActionBarProps) => {
  const [open, setOpen] = useState(false);

  const actions = (
    <>
      {buttonType === 'add' && (
        <Button
          icon={<AddCircle />}
          variant={'quiet'}
          color={'success'}
          onClick={onActionButtonClick}
          aria-label={'soft-add'}
        ></Button>
      )}
      {buttonType === 'remove' && (
        <Button
          icon={<MinusCircle />}
          variant={'quiet'}
          color={'danger'}
          onClick={onActionButtonClick}
          aria-label={'soft-remove'}
        ></Button>
      )}
    </>
  );

  return (
    <ActionBar
      title={<p className={classes.accordionHeaderTitle}>{title}</p>}
      subtitle={subtitle}
      actions={actions}
      color={color}
      open={open}
      onClick={() => {
        setOpen(!open);
      }}
    >
      {' '}
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
            <p className={classes.scopeText}>{t('api_delegation.description')}</p>
            <div className={classes.contentTexts}>{topContentText}</div>
          </div>
        )}
        {topContentText === undefined && (
          <div className={classes.contentTexts}>{t('api_delegation.data_retrieval_failed')}</div>
        )}
        {bottomContentText && (
          <div>
            <div className={classes.line}>
              <Line />
            </div>
            <p className={classes.scopeText}>{t('api_delegation.additional_description')}</p>
            <div className={classes.bottomContentTexts}>{bottomContentText}</div>
          </div>
        )}
        {bottomContentText === undefined && (
          <div className={classes.contentTexts}>{t('api_delegation.data_retrieval_failed')}</div>
        )}
      </div>
    </ActionBar>
  );
};
