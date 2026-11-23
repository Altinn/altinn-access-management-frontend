import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type {
  ResourceDelegation,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { getInheritedStatus } from '@/features/amUI/common/useInheritedStatus';

import { DelegationAction } from '../../EditModal';
import { useDelegationModalContext } from '../../DelegationModalContext';
import { usePartyRepresentation } from '../../../PartyRepresentationContext/PartyRepresentationContext';
import { useCanRedelegateResource, useRevokeConfirmation } from '../../../RevokeConfirmation';
import { useRenderSearchResultControl } from '../createSearchResultControlsRenderer';

import { useResourceListDelegation } from './useResourceListDelegation';
import { useSingleRightRequests } from './useSingleRightRequests';

interface UseSingleRightsListControlsProps {
  /** Services already delegated to `toParty`. Decides between give/request and delete. */
  delegatedResources?: ResourceDelegation[];
  availableActions?: DelegationAction[];
  /**
   * Opens the service's info view. Called with `error = true` when a give/request/revoke from the
   * row failed; the error is then already set in DelegationModalContext's `actionError`.
   */
  onSelect: (resource: ServiceResource, error?: boolean) => void;
  /** Called after a give or revoke from the row succeeded, e.g. to restore focus. */
  onSuccess?: (resource: ServiceResource) => void;
}

/**
 * Row controls (give / request / delete request / delete) for lists of single rights services,
 * as used in the "Gi fullmakt" search. Must be rendered inside a DelegationModalProvider and a
 * PartyRepresentationProvider with a `toParty`.
 *
 * Render `revokeConfirmationDialog` next to the list.
 */
export const useSingleRightsListControls = ({
  delegatedResources,
  availableActions,
  onSelect,
  onSuccess,
}: UseSingleRightsListControlsProps) => {
  const { setActionError } = useDelegationModalContext();
  const { actingParty, fromParty, toParty } = usePartyRepresentation();

  const { createRequest, deleteRequest, hasPendingRequest, isLoadingRequest } =
    useSingleRightRequests({
      canRequestRights: availableActions?.includes(DelegationAction.REQUEST) ?? false,
      actingPartyUuid: actingParty?.id,
      fromPartyUuid: fromParty?.id,
      onCreateRequestError: (resource) => onSelect(resource),
      onDeleteRequestError: (resource) => onSelect(resource),
    });

  const { canRedelegateResource } = useCanRedelegateResource();
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();

  const { delegateFromList, revokeFromList, isResourceLoading } = useResourceListDelegation({
    onActionError: (resource, errorInfo) => {
      onSelect(resource, true);
      setActionError(errorInfo);
    },
    onSuccess: (resource) => {
      setActionError(null);
      onSuccess?.(resource);
    },
    onMissingAccessToAllActions: (resource) => {
      setActionError(null);
      onSelect(resource);
    },
  });

  const confirmAndRevokeFromList = (resource: ServiceResource) =>
    confirmRevoke(
      resource.identifier,
      () => canRedelegateResource(resource.identifier),
      () => revokeFromList(resource),
      {
        name: resource.title,
        toName: formatEntityDisplayName(toParty),
      },
    );

  const isDelegated = (resourceId: string) =>
    delegatedResources?.some((delegation) => delegation.resource?.identifier === resourceId) ??
    false;

  const isInherited = (resourceId: string) => {
    const delegation = delegatedResources?.find((item) => item.resource?.identifier === resourceId);
    if (!delegation) {
      return false;
    }
    return (
      getInheritedStatus({
        permissions: delegation.permissions,
        toParty,
      }).length > 0
    );
  };

  const renderControls = useRenderSearchResultControl({
    isDelegated,
    isInherited,
    isRequested: hasPendingRequest,
    availableActions,
    isResourceLoading: (resourceId) =>
      isResourceLoading(resourceId) || isLoadingRequest(resourceId),
    setActionError,
    revokeFromList: (resource) => void confirmAndRevokeFromList(resource),
    delegateFromList: (resource) => void delegateFromList(resource),
    requestFromList: createRequest,
    deleteRequestFromList: deleteRequest,
  });

  return { renderControls, isDelegated, revokeConfirmationDialog };
};
