import { Button, Paragraph, Spinner } from '@digdir/design-system-react';
import { useState } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import { useMediaQuery } from '@/resources/hooks';

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
  isLoading: boolean;
  errorCode?: string;
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
  isLoading,
  errorCode = '',
}: DelegationActionBarProps) => {
  const [open, setOpen] = useState(false);
  const [actionBarColor, setActionBarColor] = useState(color);
  const { t } = useTranslation('common');

  React.useEffect(() => {
    if (errorCode !== '') {
      setOpen(true);
      setActionBarColor('danger');
    }
  }, [errorCode]);

  const actions = (
    <>
      {buttonType === 'add' &&
        (isLoading === true ? (
          <Spinner
            title={t('common.loading')}
            variant='interaction'
            size='medium'
          />
        ) : (
          <Button
            icon={<PlusCircleIcon />}
            variant={'tertiary'}
            color={'success'}
            onClick={onActionButtonClick}
            aria-label={t('common.add') + ' ' + title}
            size='large'
          ></Button>
        ))}
      {buttonType === 'remove' && (
        <Button
          icon={<MinusCircleIcon />}
          variant={'tertiary'}
          color={'danger'}
          onClick={onActionButtonClick}
          aria-label={t('common.remove') + ' ' + title}
          size='large'
        ></Button>
      )}
    </>
  );

  return (
    <ActionBar
      title={<p className={classes.actionBarHeaderTitle}>{title}</p>}
      subtitle={subtitle}
      actions={actions}
      size='medium'
      color={actionBarColor}
      open={open}
      onClick={() => {
        setOpen(!open);
      }}
    >
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
