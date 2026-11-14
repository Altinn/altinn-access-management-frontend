import { useEffect, useMemo, useRef, useState } from 'react';
import { DsAlert, DsParagraph, useSnackbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/dataObjects/dtos/Party';
import { getActionError, type ActionError } from '@/resources/hooks/useActionError';
import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import {
  useDelegateRightsMutation,
  useRevokeResourceMutation,
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';

import { DelegationAction } from '../common/DelegationModal/EditModal';
import { ResourceAlert } from '../common/DelegationModal/SingleRights/ResourceAlert';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  RestoreFocusFallback,
  useRestoreFocusContext,
  useRestoreFocusOnDataChange,
} from '../common/RestoreFocus';
import { PageDivider } from '../common/PageDivider/PageDivider';
import { useCanRedelegateResource, useRevokeConfirmation } from '../common/RevokeConfirmation';
import { useDelegableRights } from '../common/RightsPicker/useDelegableRights';
import { StatusSection } from '../common/StatusSection/StatusSection';
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

  // The dialog offers both giving and revoking; ResourceInfo only shows the revoke button when the
  // user actually holds the service, so it needs no per-user mode.
  const [selectedUser, setSelectedUser] = useState<UserActionTarget | null>(null);
  // Set when a delegation from the list failed, so the dialog opens on that user and says why.
  const [selectedUserError, setSelectedUserError] = useState<ActionError | null>(null);

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
      actingParty: actingParty?.id || '',
      from: fromParty?.id || '',
    },
    { skip: !actingParty?.id || !fromParty?.id },
  );

  const permissions = useMemo(
    () => delegations?.find((d) => d.resource?.identifier === resourceId)?.permissions ?? [],
    [delegations, resourceId],
  );

  const users = useMemo(
    () => mapPermissionsToUserSearchNodes(permissions, { fromPartyUuid: fromParty?.id }),
    [permissions, fromParty?.id],
  );

  const {
    data: indirectConnections,
    isLoading: isIndirectLoading,
    isFetching: isIndirectFetching,
    isError: isIndirectError,
    error: indirectError,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.id ?? '',
      fromUuid: fromParty?.id ?? '',
      toUuid: '', // all
    },
    { skip: !fromParty?.id },
  );

  const indirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  // Neither check depends on who the recipient is, so the page can tell up front whether the service
  // can be given to anyone. When it cannot, the reason is shown under the description, as ResourceInfo
  // does in the dialogs, and the ways of giving it are hidden.
  const {
    rights,
    isLoading: isRightsLoading,
    errorDetails: rightsErrorDetails,
  } = useDelegableRights({ resourceId, isEnabled: !!resource });
  const cannotDelegateHere = resource?.delegable === false;
  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus = rights.length > 0 && !hasDelegableRights;
  // An undelegable service gets both the status section and the alert, as in ResourceInfo.
  const displayResourceAlert =
    cannotDelegateHere || !!rightsErrorDetails || showMissingRightsStatus;
  // Hold the ways of giving the service back until eligibility is known.
  const canDelegate = !isRightsLoading && !displayResourceAlert;

  const [delegateRights, { isLoading: isDelegating }] = useDelegateRightsMutation();
  const [revokeResource, { isLoading: isRevoking }] = useRevokeResourceMutation();
  const { canRedelegateResource } = useCanRedelegateResource();
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();
  const requestFocusAfterListChange = useRestoreFocusOnDataChange(permissions);

  useEffect(() => {
    if (selectedUser && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [selectedUser]);

  const openModalFor = (user: UserActionTarget, error: ActionError | null = null) => {
    setSelectedUserError(error);
    setSelectedUser(user);
  };

  const formatUserName = (user: UserActionTarget) => formatEntityDisplayName(user);

  // The added user only shows up once the delegations query comes back, so hold the confirmation
  // until then and it arrives together with the row it is about.
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isDelegationsFetching });

  const handleUserAdded = (user: AddedServiceUser) =>
    queueSnackbar(
      t('service_poa_details_page.delegation_success', {
        name: formatEntityDisplayName({
          name: user.name,
          type: user.type === 'org' ? PartyType.Organization : PartyType.Person,
        }),
        service: resource?.title,
      }),
    );

  // Giving from the list gives the whole service, as the resource list in the Users view does. When
  // only some of the actions can be passed on, or the delegation fails, the dialog opens instead so
  // the user sees which actions are left out, or why it failed. The list only offers this once
  // canDelegate says at least one action is delegable.
  const handleDelegate = (user: UserActionTarget) => {
    if (!actingParty?.id || !fromParty?.id || !resourceId) return;
    if (rights.length === 0 || rights.some((r) => !r.delegable)) {
      openModalFor(user);
      return;
    }
    const actionKeys = rights.map((r) => r.rightKey);

    delegateRights({
      partyUuid: actingParty.id,
      fromUuid: fromParty.id,
      toUuid: user.id,
      resourceId,
      actionKeys,
    })
      .unwrap()
      .then(() => {
        // The row moves from the users without access to those with it once the delegations query
        // refetches, so focus follows it there.
        requestFocusAfterListChange(user.id, USER_SEARCH_FALLBACK_ID);
        queueSnackbar(
          t('service_poa_details_page.delegation_success', {
            name: formatUserName(user),
            service: resource?.title,
          }),
        );
      })
      .catch((error: unknown) => openModalFor(user, getActionError(error)));
  };

  const handleRevoke = (user: UserActionTarget) => {
    if (!actingParty?.id || !fromParty?.id || !resourceId) return;

    const revoke = () => {
      revokeResource({
        party: actingParty.id,
        from: fromParty.id,
        to: user.id,
        resourceId,
      })
        .unwrap()
        .then(() => {
          // Revoking from the list removes the row once the delegations query refetches, so defer
          // focus restoration until then. (Revoking in the dialog keeps focus there until it closes.)
          requestFocusAfterListChange(user.id, USER_SEARCH_FALLBACK_ID);
          openSnackbar({
            message: t('service_poa_details_page.revoke_success', {
              name: formatUserName(user),
              service: resource?.title,
            }),
            color: 'success',
          });
        })
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
    <>
      <StatusSection
        cannotDelegateHere={cannotDelegateHere}
        showDelegationCheckWarning={showMissingRightsStatus}
      />
      {resource?.description && <DsParagraph>{resource.description}</DsParagraph>}
      {resource?.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
      {resource && displayResourceAlert && (
        <ResourceAlert
          resource={resource}
          error={rightsErrorDetails}
          rightReasons={rights.flatMap((r) => r.delegationReasons)}
        />
      )}
      <PageDivider className={classes.divider} />
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
              isListLoading ||
              isDelegationsFetching ||
              isIndirectFetching ||
              isDelegating ||
              isRevoking
            }
            canDelegate={canDelegate}
            noUsersText={t('service_poa_details_page.no_users')}
            searchPlaceholder={t('service_poa_details_page.search_placeholder')}
            AddUserButton={
              <AddServiceUserButton
                resource={resource}
                onUserAdded={handleUserAdded}
              />
            }
            onSelect={(user) => openModalFor(user)}
            onDelegate={handleDelegate}
            onRevoke={handleRevoke}
          />
        </RestoreFocusFallback>

        {resource && selectedUser && (
          <ServiceUserModal
            ref={modalRef}
            resource={resource}
            user={selectedUser}
            partyUuid={fromParty?.id ?? ''}
            availableActions={
              selectedUser.isVendorFixedRights
                ? []
                : [DelegationAction.DELEGATE, DelegationAction.REVOKE]
            }
            actionError={selectedUserError}
            onClose={() => {
              // Restore focus synchronously to the row that opened the dialog before clearing state.
              // If the user was revoked inside the dialog their row is gone, so the fallback catches it.
              restoreFocus?.requestFocus(selectedUser.id, USER_SEARCH_FALLBACK_ID);
              setSelectedUser(null);
              setSelectedUserError(null);
            }}
          />
        )}
        {revokeConfirmationDialog}
      </div>
    </>
  );
};
