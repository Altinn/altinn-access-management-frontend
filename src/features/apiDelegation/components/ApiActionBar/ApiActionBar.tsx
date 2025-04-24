import { useEffect, useLayoutEffect, useState } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import {
  DsButton,
  DsHeading,
  DsAlert,
  DsParagraph,
  DsListUnordered,
  DsSpinner,
  DsListItem,
} from '@altinn/altinn-components';

import classes from './ApiActionBar.module.css';

import { ActionBar, type ActionBarProps } from '@/components';
import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import { type DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { useDelegationCheckMutation } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  DelegationAccessResult,
  ResourceReference,
} from '@/dataObjects/dtos/resourceDelegation';
import ScopeList from '@/components/ScopeList/ScopeList';
import { getButtonIconSize } from '@/resources/utils';

export interface ApiActionBarProps extends Pick<ActionBarProps, 'color'> {
  /** Defines the functionality and behaviour of the actionbar, whether it is used to add a new api or to remove one that was previously added */
  variant: 'add' | 'remove';
  /** Used when the variant equals 'add'. The callback that is triggered when the user clicks the add button, if they pass the delegationCheck. */
  onAdd?: () => void;
  /** Used when the variant equals 'remove'. The callback that is triggered when the user clicks the remove button. */
  onRemove?: () => void;
  /** The API to be represented */
  api: DelegableApi;
  /** Whether or not to run a delegationCheck on initialization. Used for deep links with pre-chosen API's */
  initWithDelegationCheck?: boolean;
}

export const ApiActionBar = ({
  variant,
  onAdd,
  onRemove,
  api,
  initWithDelegationCheck = false,
}: ApiActionBarProps) => {
  const [open, setOpen] = useState(false);
  const [actionBarColor, setActionBarColor] = useState<'success' | 'danger' | 'neutral'>(
    variant === 'remove' ? 'success' : 'neutral',
  );
  const { t } = useTranslation();
  const resourceRef: ResourceReference = { resource: api.authorizationReference };
  const partyId = getCookie('AltinnPartyId');

  const [delegationCheck, { data: accessResult, error, isLoading }] = useDelegationCheckMutation();

  const isNotDelegable = error || (accessResult && accessResult.status === 'NotDelegable');

  useLayoutEffect(() => {
    if (initWithDelegationCheck) {
      delegationCheck({ partyId, resourceRef });
    }
  }, []);

  useEffect(() => {
    if (isNotDelegable) {
      setOpen(true);
      setActionBarColor('danger');
    }
  }, [isNotDelegable]);

  const onAddClick = () => {
    delegationCheck({ partyId, resourceRef })
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
        (isLoading === true ? (
          <DsSpinner
            aria-label={t('common.loading')}
            data-size='md'
          />
        ) : (
          <DsButton
            variant={'tertiary'}
            data-color='accent'
            onClick={onAddClick}
            aria-label={t('common.add') + ' ' + api.apiName}
            data-size='lg'
            icon
          >
            <PlusCircleIcon fontSize={getButtonIconSize(false)} />
          </DsButton>
        ))}
      {variant === 'remove' && (
        <DsButton
          variant={'tertiary'}
          color={'danger'}
          onClick={onRemove}
          aria-label={t('common.remove') + ' ' + api.apiName}
          data-size='lg'
          className={classes.actionButton}
          icon
        >
          <MinusCircleIcon fontSize={getButtonIconSize(false)} />
        </DsButton>
      )}
    </>
  );

  const content = () => {
    return (
      <div className={classes.content}>
        {api.scopes?.length > 0 && (
          <div className={classes.scopeList}>
            <DsHeading
              data-size='2xs'
              level={5}
              className={classes.actionBarContentHeading}
            >
              <>{t('api_delegation.scopes')}:</>
            </DsHeading>
            <ScopeList scopeList={api.scopes} />
          </div>
        )}
        {api.rightDescription && (
          <>
            <DsHeading
              data-size='2xs'
              level={5}
              className={classes.actionBarContentHeading}
            >
              {t('api_delegation.description')}
            </DsHeading>
            <DsParagraph>{api.rightDescription}</DsParagraph>
          </>
        )}
        {api.rightDescription === undefined && (
          <DsParagraph>{t('api_delegation.data_retrieval_failed')}</DsParagraph>
        )}
        {api.description && (
          <>
            <DsHeading
              data-size='2xs'
              level={5}
              className={classes.actionBarContentHeading}
            >
              {t('api_delegation.additional_description')}
            </DsHeading>
            <DsParagraph>{api.description}</DsParagraph>
          </>
        )}
        {api.description === undefined && (
          <DsParagraph>{t('api_delegation.data_retrieval_failed')}</DsParagraph>
        )}
      </div>
    );
  };

  const errorContent = () => {
    if (error) {
      return (
        <DsAlert
          role='alert'
          data-color='danger'
          className={classes.errorContent}
        >
          <DsParagraph variant='long'>
            {t(`${getErrorCodeTextKey(ErrorCode.HTTPError)}`)}
          </DsParagraph>
        </DsAlert>
      );
    } else if (accessResult?.details[0].code === ErrorCode.InsufficientAuthenticationLevel) {
      return (
        <DsAlert
          role='alert'
          data-color='danger'
          className={classes.errorContent}
        >
          <DsParagraph variant='long'>
            {t(`${getErrorCodeTextKey(ErrorCode.InsufficientAuthenticationLevel)}`)}
          </DsParagraph>
          <DsListUnordered>
            <DsListItem>{t('common.minid')}</DsListItem>
            <DsListItem>{t('common.bankid')}</DsListItem>
            <DsListItem>{t('common.commfides')}</DsListItem>
            <DsListItem>{t('common.buypass')}</DsListItem>
          </DsListUnordered>
        </DsAlert>
      );
    } else if (accessResult?.details[0].code === ErrorCode.MissingRoleAccess) {
      return (
        <DsAlert
          role='alert'
          data-color='danger'
          className={classes.errorContent}
        >
          <DsParagraph>
            {t('single_rights.missing_role_access', { you: t('common.you_uppercase') })}{' '}
            {t('single_rights.ceo_or_main_admin_can_help')}
          </DsParagraph>
        </DsAlert>
      );
    } else {
      return (
        <DsAlert
          role='alert'
          data-color='danger'
          className={classes.errorContent}
        >
          <DsParagraph>{t(`${getErrorCodeTextKey('')}`)}</DsParagraph>
        </DsAlert>
      );
    }
  };

  return (
    <ActionBar
      title={<span className={classes.actionBarHeaderTitle}>{api.apiName}</span>}
      subtitle={api.orgName}
      actions={actions}
      size='medium'
      color={actionBarColor}
      open={open}
      headingLevel={4}
      onClick={() => {
        setOpen(!open);
      }}
    >
      {isNotDelegable ? errorContent() : content()}
    </ActionBar>
  );
};
