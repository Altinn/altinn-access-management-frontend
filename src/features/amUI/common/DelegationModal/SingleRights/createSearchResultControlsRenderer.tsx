import { DsButton } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { DelegationAction } from '../EditModal';

// DOM id for a resource's inline action button; used as a RestoreFocus target after delegate/revoke.
export const resourceActionControlId = (resourceId: string) => `list-action-${resourceId}`;

type UseRenderSearchResultControlProps = {
  isDelegated: (resourceId: string) => boolean;
  isInherited: (resourceId: string) => boolean;
  isRequested: (resourceId: string) => boolean;
  availableActions?: DelegationAction[];
  isResourceLoading: (resourceId: string) => boolean;
  setActionError: (error: ActionError | null) => void;
  revokeFromList: (resource: ServiceResource) => void;
  delegateFromList: (resource: ServiceResource) => void;
  requestFromList: (resource: ServiceResource) => void;
  deleteRequestFromList: (resource: ServiceResource) => void;
};

export const useRenderSearchResultControl = ({
  isDelegated,
  isInherited,
  isRequested,
  availableActions,
  isResourceLoading,
  setActionError,
  revokeFromList,
  delegateFromList,
  requestFromList,
  deleteRequestFromList,
}: UseRenderSearchResultControlProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobileOrSmaller();

  return (resource: ServiceResource) => {
    if (isMobile) return null;

    const isAlreadyDelegated = isDelegated(resource.identifier);
    const isResourceInherited = isInherited(resource.identifier);
    const canRevoke = availableActions?.includes(DelegationAction.REVOKE);
    const canDelegate = availableActions?.includes(DelegationAction.DELEGATE);
    const canRequest = availableActions?.includes(DelegationAction.REQUEST);
    const isAlreadyRequested = isRequested(resource.identifier);
    const isLoading = isResourceLoading(resource.identifier);

    if (isAlreadyDelegated && canRevoke) {
      return (
        <DsButton
          id={resourceActionControlId(resource.identifier)}
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading || isResourceInherited}
          onClick={() => {
            setActionError(null);
            revokeFromList(resource);
          }}
          aria-label={t('common.delete_poa_for', { poa_object: resource.title })}
        >
          <MinusCircleIcon aria-hidden='true' />
          {t('common.delete_poa')}
        </DsButton>
      );
    }

    if (!isAlreadyDelegated && canDelegate) {
      return (
        <DsButton
          id={resourceActionControlId(resource.identifier)}
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading}
          onClick={() => {
            setActionError(null);
            delegateFromList(resource);
          }}
          aria-label={t('common.give_poa_for', { poa_object: resource.title })}
        >
          <PlusCircleIcon aria-hidden='true' />
          {t('common.give_poa')}
        </DsButton>
      );
    }

    if (isAlreadyRequested) {
      return (
        <DsButton
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading}
          onClick={() => {
            deleteRequestFromList(resource);
          }}
          aria-label={t('common.delete_request_for', { poa_object: resource.title })}
        >
          <MinusCircleIcon aria-hidden='true' />
          {t('delegation_modal.request.delete_request')}
        </DsButton>
      );
    }

    if (resource.delegable && !isAlreadyDelegated && canRequest) {
      return (
        <DsButton
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading}
          onClick={() => {
            requestFromList(resource);
          }}
          aria-label={t('common.request_poa_for', { poa_object: resource.title })}
        >
          <PlusCircleIcon aria-hidden='true' />
          {t('common.request_poa')}
        </DsButton>
      );
    }

    return null;
  };
};
