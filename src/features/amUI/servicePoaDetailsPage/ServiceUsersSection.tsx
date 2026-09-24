import { useEffect, useMemo, useRef, useState } from 'react';
import { DsAlert, DsParagraph, formatDisplayName, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import {
  useRevokeResourceMutation,
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';

import { DelegationAction } from '../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  RestoreFocusFallback,
  useRestoreFocusContext,
  useRestoreFocusOnDataChange,
} from '../common/RestoreFocus';
import { useCanRedelegateResource, useRevokeConfirmation } from '../common/RevokeConfirmation';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import type { UserActionTarget } from '../common/UserSearch/types';
import UserSearch from '../common/UserSearch/UserSearch';

import { AddServiceUserButton, type AddedServiceUser } from './AddServiceUserModal';
import { ServiceUserModal } from './ServiceUserModal';
import classes from './ServicePoaDetailsPage.module.css';

interface ServiceUsersSectionProps {
  resource?: ServiceResource;
  isLoading: boolean;
}

// Focus-restore fallback for this zone: when a revoked row is gone, focus lands on the search field
// right above the list instead of the page heading. Unique within this provider zone.
const USER_SEARCH_FALLBACK_ID = 'service_poa_user_search';

export const ServiceUsersSection = ({ resource, isLoading }: ServiceUsersSectionProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();
  const restoreFocus = useRestoreFocusContext();
  const modalRef = useRef<HTMLDialogElement>(null);
  const resourceId = resource?.identifier ?? '';

  // 'edit' opens on a user that already holds the service, 'delegate' on one that does not (an
  // indirect right holder, or a user just added). Both open the same dialog; the mode only decides
  // whether revoking is offered there.
  const [selectedUser, setSelectedUser] = useState<UserActionTarget | null>(null);
  const [selectedUserMode, setSelectedUserMode] = useState<'edit' | 'delegate'>('edit');

  // No `to`: this returns the services delegated from the reportee to everyone, which is the same
  // cache entry the overview already holds, so the permissions for this service arrive with it.
  const {
    data: delegations,
    isLoading: isDelegationsLoading,
    isFetching: isDelegationsFetching,
    isError: isDelegationsError,
    error: delegationsError,
  } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
    },
    { skip: !actingParty?.partyUuid || !fromParty?.partyUuid },
  );

  const permissions = useMemo(
    () => delegations?.find((d) => d.resource?.identifier === resourceId)?.permissions ?? [],
    [delegations, resourceId],
  );

  const users = useMemo(
    () => mapPermissionsToUserSearchNodes(permissions, { fromPartyUuid: fromParty?.partyUuid }),
    [permissions, fromParty?.partyUuid],
  );

  const {
    data: indirectConnections,
    isLoading: isIndirectLoading,
    isFetching: isIndirectFetching,
    isError: isIndirectError,
    error: indirectError,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '', // all
    },
    { skip: !fromParty?.partyUuid },
  );

  const indirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  const [revokeResource, { isLoading: isRevoking }] = useRevokeResourceMutation();
  const { canRedelegateResource } = useCanRedelegateResource();
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();
  const requestFocusAfterListChange = useRestoreFocusOnDataChange(permissions);

  useEffect(() => {
    if (selectedUser && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [selectedUser]);

  const openModalFor = (user: UserActionTarget, mode: 'edit' | 'delegate') => {
    setSelectedUserMode(mode);
    setSelectedUser(user);
  };

  const formatUserName = (user: { name: string; type?: string }) =>
    formatDisplayName({
      fullName: user.name,
      type: user.type?.toLowerCase() === 'person' ? 'person' : 'company',
    });

  // The added user only shows up once the delegations query comes back, so hold the confirmation
  // until then and it arrives together with the row it is about.
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isDelegationsFetching });

  const handleUserAdded = (user: AddedServiceUser) =>
    queueSnackbar(
      t('service_poa_details_page.delegation_success', {
        name: formatUserName(user),
        service: resource?.title,
      }),
    );

  const handleRevoke = (user: UserActionTarget) => {
    if (!actingParty?.partyUuid || !fromParty?.partyUuid || !resourceId) return;

    const revoke = () => {
      // Revoking from the list removes the row once the delegations query refetches, so defer
      // focus restoration until then. (Revoking in the dialog keeps focus there until it closes.)
      requestFocusAfterListChange(user.id, USER_SEARCH_FALLBACK_ID);
      revokeResource({
        party: actingParty.partyUuid,
        from: fromParty.partyUuid,
        to: user.id,
        resourceId,
      })
        .unwrap()
        .then(() =>
          openSnackbar({
            message: t('service_poa_details_page.revoke_success', {
              name: formatUserName(user),
              service: resource?.title,
            }),
            color: 'success',
          }),
        )
        .catch(() =>
          openSnackbar({
            message: t('service_poa_details_page.revoke_error', {
              name: formatUserName(user),
              service: resource?.title,
            }),
            color: 'danger',
          }),
        );
    };

    void confirmRevoke(
      `${resourceId}-${user.id}`,
      () => canRedelegateResource(resourceId, user.id),
      revoke,
      { name: resource?.title ?? '', toName: formatUserName(user) },
    );
  };

  const errorDetails =
    isDelegationsError || isIndirectError
      ? createErrorDetails(delegationsError || indirectError)
      : null;

  const isListLoading = isLoading || isDelegationsLoading || isIndirectLoading;

  return (
    <div className={classes.usersSection}>
      <DsParagraph data-size='md'>{t('service_poa_details_page.users_description')}</DsParagraph>

      {errorDetails && (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            size='sm'
            status={errorDetails.status}
            time={errorDetails.time}
            traceId={errorDetails.traceId}
          />
        </DsAlert>
      )}

      <RestoreFocusFallback>
        <UserSearch
          includeSelfAsChild={false}
          restoreFocusFallbackId={USER_SEARCH_FALLBACK_ID}
          users={users}
          indirectUsers={indirectUsers}
          isLoading={isListLoading}
          isActionLoading={
            isListLoading || isDelegationsFetching || isIndirectFetching || isRevoking
          }
          canDelegate
          noUsersText={t('service_poa_details_page.no_users')}
          searchPlaceholder={t('service_poa_details_page.search_placeholder')}
          AddUserButton={
            <AddServiceUserButton
              resourceId={resourceId}
              onUserAdded={handleUserAdded}
            />
          }
          onSelect={(user) => openModalFor(user, 'edit')}
          onDelegate={(user) => openModalFor(user, 'delegate')}
          onRevoke={handleRevoke}
        />
      </RestoreFocusFallback>

      {resource && selectedUser && (
        <ServiceUserModal
          ref={modalRef}
          resource={resource}
          user={selectedUser}
          partyUuid={fromParty?.partyUuid ?? ''}
          availableActions={
            selectedUserMode === 'delegate'
              ? [DelegationAction.DELEGATE]
              : [DelegationAction.DELEGATE, DelegationAction.REVOKE]
          }
          onClose={() => {
            // Restore focus synchronously to the row that opened the dialog before clearing state.
            // If the user was revoked inside the dialog their row is gone, so the fallback catches it.
            restoreFocus?.requestFocus(selectedUser.id, USER_SEARCH_FALLBACK_ID);
            setSelectedUser(null);
          }}
        />
      )}
      {revokeConfirmationDialog}
    </div>
  );
};
