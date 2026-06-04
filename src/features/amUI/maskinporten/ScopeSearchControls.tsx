import {
  Button,
  SnackbarDuration,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useAddMaskinportenSupplierResourceMutation,
  useLazyMaskinportenResourceDelegationCheckQuery,
  useRemoveMaskinportenSupplierResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useMaskinportenResourceActions } from './hooks/useMaskinportenResourceActions';

interface ScopeSearchControlsProps {
  resource: ServiceResource;
  hasDelegatedResource: boolean;
  isDelegatedResourcesLoading: boolean;
  onSelect: (resource: ServiceResource, error?: boolean) => void;
}

export const ScopeSearchControls = ({
  resource,
  hasDelegatedResource,
  isDelegatedResourcesLoading,
  onSelect,
}: ScopeSearchControlsProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const isMobile = useIsMobileOrSmaller();
  const { fromParty, toParty } = usePartyRepresentation();
  const { setActionError } = useDelegationModalContext();
  const [isCheckingDelegation, setIsCheckingDelegation] = React.useState(false);
  const supplier = toParty?.orgNumber ?? '';
  const toPartyName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  const [addSupplierResource] = useAddMaskinportenSupplierResourceMutation();
  const [removeSupplierResource] = useRemoveMaskinportenSupplierResourceMutation();
  const { delegate, remove, isLoading } = useMaskinportenResourceActions({
    delegate: (r) =>
      addSupplierResource({
        party: fromParty?.partyUuid ?? '',
        supplier,
        resource: r.identifier,
      }).unwrap(),
    remove: (r) =>
      removeSupplierResource({
        party: fromParty?.partyUuid ?? '',
        supplier,
        resource: r.identifier,
      }).unwrap(),
  });
  const [checkDelegation] = useLazyMaskinportenResourceDelegationCheckQuery();

  const onActionSuccess = (mode: 'delegate' | 'revoke') => {
    setActionError(null);
    openSnackbar({
      message: t(
        mode === 'delegate'
          ? 'single_rights.add_singleRight_success_message'
          : 'single_rights.delete_singleRight_success_message',
        { name: toPartyName, resourceTitle: resource.title },
      ),
      color: 'success',
      duration: SnackbarDuration.normal,
    });
  };

  const handleAddResource = async () => {
    if (!fromParty?.partyUuid || !resource.identifier) return;

    setIsCheckingDelegation(true);
    try {
      const delegationCheck = await checkDelegation({
        party: fromParty.partyUuid,
        resource: resource.identifier,
      }).unwrap();
      const canDelegateResource = delegationCheck.rights?.some((right) => right.result) ?? false;

      if (!canDelegateResource) {
        onSelect(resource);
        return;
      }

      delegate(resource, {
        onSuccess: () => onActionSuccess('delegate'),
        onError: (_, error) => {
          setActionError(error);
          onSelect(resource, true);
        },
      });
    } catch {
      onSelect(resource);
    } finally {
      setIsCheckingDelegation(false);
    }
  };

  const handleRemoveResource = () =>
    remove(resource, {
      onSuccess: () => onActionSuccess('revoke'),
      onError: (_, error) => {
        setActionError(error);
        onSelect(resource, true);
      },
    });

  const resourceLoading = isLoading(resource.identifier) || isCheckingDelegation;

  if (isMobile) return null;

  if (hasDelegatedResource) {
    return (
      <Button
        variant='tertiary'
        size='sm'
        loading={resourceLoading}
        disabled={resourceLoading || isDelegatedResourcesLoading}
        onClick={() => {
          setActionError(null);
          handleRemoveResource();
        }}
        aria-label={t('common.delete_poa_for', { poa_object: resource.title })}
      >
        <MinusCircleIcon aria-hidden='true' />
        {t('common.delete_poa')}
      </Button>
    );
  }

  return (
    <Button
      variant='tertiary'
      size='sm'
      loading={resourceLoading}
      disabled={resourceLoading || isDelegatedResourcesLoading || resource.delegable === false}
      onClick={() => {
        setActionError(null);
        handleAddResource();
      }}
      aria-label={t('common.give_poa_for', { poa_object: resource.title })}
    >
      <PlusCircleIcon aria-hidden='true' />
      {t('common.give_poa')}
    </Button>
  );
};
