import { Button, List, Paragraph, Spinner, Alert, Heading } from '@digdir/design-system-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import { ActionBar, type ActionBarProps } from '@/components';
import { ErrorCode, getErrorCodeTextKey } from '@/resources/utils/errorCodeUtils';
import { type DelegableApi } from '@/rtk/features/apiDelegation/delegableApi/delegableApiSlice';
import { useDelegationCheckMutation } from '@/rtk/features/apiDelegation/apiDelegationApi';
import type { ResourceReference } from '@/rtk/features/apiDelegation/apiDelegationApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { DelegationAccessResult } from '@/dataObjects/dtos/resourceDelegation';
import ScopeList from '@/components/ScopeList/ScopeList';

import classes from './ApiActionBar.module.css';

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
  const { t } = useTranslation('common');
  const authorizationReference: ResourceReference = { resource: api.authorizationReference };
  const partyId = getCookie('AltinnPartyId');

  const [delegationCheck, { data: accessResult, error, isLoading }] = useDelegationCheckMutation();

  const isNotDelegable = error || (accessResult && accessResult.status === 'NotDelegable');

  useLayoutEffect(() => {
    if (initWithDelegationCheck) {
      delegationCheck({ partyId, resourceRef: authorizationReference });
    }
  }, []);

  useEffect(() => {
    if (isNotDelegable) {
      setOpen(true);
      setActionBarColor('danger');
    }
  }, [isNotDelegable]);

  const onAddClick = () => {
    delegationCheck({ partyId, resourceRef: authorizationReference })
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
          <Spinner
            title={t('common.loading')}
            variant='interaction'
            size='medium'
          />
        ) : (
          <Button
            variant={'tertiary'}
            color={'second'}
            onClick={onAddClick}
            aria-label={t('common.add') + ' ' + api.apiName}
            size='large'
            className={classes.actionButton}
            icon={true}
          >
            <PlusCircleIcon />
          </Button>
        ))}
      {variant === 'remove' && (
        <Button
          variant={'tertiary'}
          color={'danger'}
          onClick={onRemove}
          aria-label={t('common.remove') + ' ' + api.apiName}
          size='large'
          className={classes.actionButton}
          icon={true}
        >
          <MinusCircleIcon />
        </Button>
      )}
    </>
  );

  const content = () => {
    return (
      <div className={classes.content}>
        {api.scopes?.length > 0 && (
          <div>
            <Heading
              size='xxsmall'
              level={4}
              spacing
            >
              {t('api_delegation.scopes')}:
            </Heading>
            <ScopeList scopeList={api.scopes} />
          </div>
        )}
        {api.rightDescription && (
          <div>
            <Heading
              size='xxsmall'
              level={4}
              spacing
            >
              {t('api_delegation.description')}
            </Heading>
            <Paragraph>{api.rightDescription}</Paragraph>
          </div>
        )}
        {api.rightDescription === undefined && (
          <Paragraph>{t('api_delegation.data_retrieval_failed')}</Paragraph>
        )}
        {api.description && (
          <div>
            <Heading
              size='xxsmall'
              level={4}
              spacing
            >
              {t('api_delegation.additional_description')}
            </Heading>
            <Paragraph>{api.description}</Paragraph>
          </div>
        )}
        {api.description === undefined && (
          <Paragraph>{t('api_delegation.data_retrieval_failed')}</Paragraph>
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
    } else if (accessResult?.details[0].code === ErrorCode.InsufficientAuthenticationLevel) {
      return (
        <Alert
          severity='danger'
          className={classes.errorContent}
        >
          <Paragraph spacing>
            {t(`${getErrorCodeTextKey(ErrorCode.InsufficientAuthenticationLevel)}`)}
          </Paragraph>
          <List.Root>
            <List.Unordered>
              <List.Item>{t('common.minid')}</List.Item>
              <List.Item>{t('common.bankid')}</List.Item>
              <List.Item>{t('common.commfides')}</List.Item>
              <List.Item>{t('common.buypass')}</List.Item>
            </List.Unordered>
          </List.Root>
        </Alert>
      );
    } else if (accessResult?.details[0].code === ErrorCode.MissingRoleAccess) {
      return (
        <Alert
          severity='danger'
          className={classes.errorContent}
        >
          <Paragraph>
            {t('single_rights.missing_role_access', { you: t('common.you_uppercase') })}{' '}
            {t('single_rights.ceo_or_main_admin_can_help')}
          </Paragraph>
        </Alert>
      );
    } else {
      return (
        <Alert
          severity='danger'
          className={classes.errorContent}
        >
          <Paragraph>{t(`${getErrorCodeTextKey('')}`)}</Paragraph>
          <Paragraph></Paragraph>
        </Alert>
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
