import { Button, List, Paragraph, Spinner, Alert } from '@digdir/design-system-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { data, error } from 'cypress/types/jquery';

import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import { type DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { useDelegationCheckMutation } from '@/rtk/features/apiDelegation/apiDelegationApi';
import type { ResourceReference } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { DelegationAccessResult } from '@/dataObjects/dtos/resourceDelegation';

import ScopeList from '../ScopeList/ScopeList';
import { ActionBar, type ActionBarProps } from '../ActionBar';

import classes from './DelegationActionBar.module.css';

export interface DelegationActionBarProps extends Pick<ActionBarProps, 'color'> {
  scopeList?: string[];
  variant: 'add' | 'remove';
  onAdd?: () => void;
  onRemove?: () => void;
  api: DelegableApi;
  isAdded?: boolean;
  initWithDelegationCheck?: boolean;
}

export const DelegationActionBar = ({
  scopeList = [''],
  variant,
  onAdd,
  onRemove,
  api,
  initWithDelegationCheck = false,
}: DelegationActionBarProps) => {
  const [open, setOpen] = useState(false);
  const [actionBarColor, setActionBarColor] = useState<'success' | 'danger' | 'neutral'>(
    variant === 'remove' ? 'success' : 'neutral',
  );
  const { t } = useTranslation('common');
  const resourceRef: ResourceReference = { resource: api.authorizationReference };
  const partyId = getCookie('AltinnPartyId');

  const [checkCanDelegate, { data: accessResult, error, isLoading: isUpdating }] =
    useDelegationCheckMutation();

  const isNotDelegable = error || (accessResult && accessResult.status === 'notDelegable');

  useLayoutEffect(() => {
    if (initWithDelegationCheck) {
      // Fetch cached data
      checkCanDelegate({ partyId, resourceRef });
    }
  }, []);

  useEffect(() => {
    if (isNotDelegable) {
      setOpen(true);
      setActionBarColor('danger');
    }
  }, [isNotDelegable]);

  const onAddClick = () => {
    checkCanDelegate({ partyId, resourceRef })
      .unwrap()
      .then((response: DelegationAccessResult) => {
        if (response?.status === 'Delegable') {
          onAdd?.();
        }
      });
  };

  const actions = (
    <>
      {variant === 'add' &&
        (isUpdating === true ? (
          <Spinner
            title={t('common.loading')}
            variant='interaction'
            size='medium'
          />
        ) : (
          <Button
            icon={<PlusCircleIcon />}
            variant={'tertiary'}
            color={'second'}
            onClick={onAddClick}
            aria-label={t('common.add') + ' ' + api.apiName}
            size='large'
          ></Button>
        ))}
      {variant === 'remove' && (
        <Button
          icon={<MinusCircleIcon />}
          variant={'tertiary'}
          color={'danger'}
          onClick={onRemove}
          aria-label={t('common.remove') + ' ' + api.apiName}
          size='large'
        ></Button>
      )}
    </>
  );

  const content = () => {
    return (
      <div className={classes.newApiAccordionContent}>
        {scopeList.length > 0 && (
          <div>
            <h4 className={classes.h4Text}>{t('api_delegation.scopes')}:</h4>
            <ScopeList scopeList={scopeList} />
          </div>
        )}
        {api.rightDescription && (
          <div>
            <h4 className={classes.h4Text}>{t('api_delegation.description')}</h4>
            <div className={classes.contentTexts}>{api.rightDescription}</div>
          </div>
        )}
        {api.rightDescription === undefined && (
          <div className={classes.contentTexts}>{t('api_delegation.data_retrieval_failed')}</div>
        )}
        {api.description && (
          <div>
            <h4 className={classes.h4Text}>{t('api_delegation.additional_description')}</h4>
            <div className={classes.bottomContentTexts}>{api.description}</div>
          </div>
        )}
        {api.description === undefined && (
          <div className={classes.contentTexts}>{t('api_delegation.data_retrieval_failed')}</div>
        )}
      </div>
    );
  };

  const errorContent = () => {
    if (error) {
      return (
        <Alert
          severity='danger'
          className={classes.errorContent}
        >
          <Paragraph spacing>{t(`${getErrorCodeTextKey(ErrorCode.HTTPError)}`)}</Paragraph>
        </Alert>
      );
    } else if (accessResult?.details.code === ErrorCode.InsufficientAuthenticationLevel) {
      return (
        <div className={classes.errorContent}>
          <Paragraph spacing>
            {t(`${getErrorCodeTextKey(ErrorCode.InsufficientAuthenticationLevel)}`)}
          </Paragraph>
          <List>
            <List.Item>{t('common.minid')}</List.Item>
            <List.Item>{t('common.bankid')}</List.Item>
            <List.Item>{t('common.commfides')}</List.Item>
            <List.Item>{t('common.buypass')}</List.Item>
          </List>
        </div>
      );
    } else if (accessResult?.details.code === ErrorCode.MissingRoleAccess) {
      return (
        <div className={classes.errorContent}>
          <Paragraph>
            {t('single_rights.missing_role_access', { you: t('common.you_uppercase') })}{' '}
            {t('single_rights.ceo_or_main_admin_can_help')}
          </Paragraph>
        </div>
      );
    } else {
      return (
        <div className={classes.errorContent}>
          <Paragraph>{t(`${getErrorCodeTextKey('')}`)}</Paragraph>
          <Paragraph></Paragraph>
        </div>
      );
    }
  };

  return (
    <ActionBar
      title={<p className={classes.actionBarHeaderTitle}>{api.apiName}</p>}
      subtitle={api.orgName}
      actions={actions}
      size='medium'
      color={actionBarColor}
      open={open}
      onClick={() => {
        setOpen(!open);
      }}
    >
      {isNotDelegable ? errorContent() : content()}
    </ActionBar>
  );
};
