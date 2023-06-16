import { Button } from '@digdir/design-system-react';
import { useState } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import { ActionBar, type ActionBarProps } from '../ActionBar';
import ScopeList from '../ScopeList/ScopeList';

import classes from './DelegationActionBar.module.css';

export interface DelegationActionBarProps extends Pick<ActionBarProps, 'color'> {
  title?: string;
  subtitle?: string;
  topContentText?: string;
  bottomContentText?: string;
  scopeList?: string[];
  buttonType: 'add' | 'remove';
  onActionButtonClick: () => void;
}

export const DelegationActionBar = ({
  title = 'No info',
  subtitle = 'No info',
  topContentText,
  bottomContentText,
  scopeList = [''],
  buttonType,
  onActionButtonClick,
  color = 'neutral',
}: DelegationActionBarProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');

  const actions = (
    <>
      {buttonType === 'add' && (
        <Button
          icon={<AddCircle />}
          variant={'quiet'}
          color={'success'}
          onClick={onActionButtonClick}
          aria-label={t('common.add') + ' ' + title}
        ></Button>
      )}
      {buttonType === 'remove' && (
        <Button
          icon={<MinusCircle />}
          variant={'quiet'}
          color={'danger'}
          onClick={onActionButtonClick}
          aria-label={t('common.remove') + ' ' + title}
        ></Button>
      )}
    </>
  );

  return (
    <ActionBar
      title={<p className={classes.actionBarHeaderTitle}>{title}</p>}
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
        {scopeList.length > 0 && (
          <div>
            <h4 className={classes.h4Text}>{t('api_delegation.scopes')}:</h4>
            <ScopeList scopeList={scopeList} />
          </div>
        )}
        {topContentText && (
          <div>
            <h4 className={classes.h4Text}>{t('api_delegation.description')}</h4>
            <div className={classes.contentTexts}>{topContentText}</div>
          </div>
        )}
        {topContentText === undefined && (
          <div className={classes.contentTexts}>{t('api_delegation.data_retrieval_failed')}</div>
        )}
        {bottomContentText && (
          <div>
            <h4 className={classes.h4Text}>{t('api_delegation.additional_description')}</h4>
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
