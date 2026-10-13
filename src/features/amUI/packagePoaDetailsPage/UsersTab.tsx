import { useMemo, useRef } from 'react';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { type ActionError } from '@/resources/hooks/useActionError';
import { type AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';

import UserSearch from '../common/UserSearch/UserSearch';
import { useAccessPackageActions } from '../common/AccessPackageList/useAccessPackageActions';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';
import { useAccessPackageDelegationCheck } from '../common/DelegationCheck/AccessPackageDelegationCheckContext';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import type { UserActionTarget } from '../common/UserSearch/types';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import {
  RestoreFocusFallback,
  useRestoreFocusContext,
  useRestoreFocusOnDataChange,
} from '../common/RestoreFocus';

import { PackageUserModal, mapUserToParty, type PackageUserModalHandle } from './PackageUserModal';
import { AddPackageUserButton, type AddedPackageUser } from './AddPackageUserModal';
import pageClasses from './PackagePoaDetailsPage.module.css';

interface UsersTabProps {
  accessPackage?: AccessPackage;
  isLoading: boolean;
  isFetching: boolean;
}

// Focus-restore fallback for this zone: when a revoked row is gone, focus lands on the search field
// (right above the list) instead of the page heading far above. Unique within this provider zone.
const USER_SEARCH_FALLBACK_ID = 'package_poa_user_search';

export const UsersTab = ({ accessPackage, isLoading, isFetching }: UsersTabProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const modalRef = useRef<PackageUserModalHandle>(null);
  const restoreFocus = useRestoreFocusContext();
  const requestFocusAfterListChange = useRestoreFocusOnDataChange(accessPackage?.permissions);
  const { canDelegatePackage, isLoading: isDelegationCheckLoading } =
    useAccessPackageDelegationCheck();
  // Both are explained by the page header, so here they only hide the ways of giving the package.
  const canDelegate =
    accessPackage?.isAssignable !== false &&
    (accessPackage?.id ? canDelegatePackage(accessPackage.id)?.result !== false : true);

  // The user the latest delegate/revoke was for, so a failure can open the dialog on them even when
  // the action was taken from the list.
  const actionTargetRef = useRef<UserActionTarget | null>(null);

  const { isLoading: roleMetadataIsLoading } = useRoleMetadata();
  const {
    data: indirectConnections,
    isLoading: loadingIndirectConnections,
    isFetching: isFetchingIndirectConnections,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '', // all
    },
    {
      skip: !fromParty?.partyUuid,
    },
  );

  const users = useMemo(
    () =>
      mapPermissionsToUserSearchNodes(accessPackage?.permissions, {
        toPartyUuid: toParty?.partyUuid,
        fromPartyUuid: fromParty?.partyUuid,
      }),
    [accessPackage?.permissions, toParty?.partyUuid, fromParty?.partyUuid],
  );

  const indirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  // The added user only shows up once the package refetches, so hold the confirmation until then and
  // it arrives together with the row it is about.
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isFetching });

  const handleUserAdded = (user: AddedPackageUser) =>
    queueSnackbar(
      t('access_packages.package_delegation_success', {
        name: formatDisplayName({
          fullName: user.name,
          type: user.type === 'person' ? 'person' : 'company',
        }),
        accessPackage: accessPackage?.name,
      }),
    );

  const handleActionError = (_accessPackage: AccessPackage, errorInfo: ActionError) => {
    if (actionTargetRef.current) {
      modalRef.current?.showError(actionTargetRef.current, errorInfo);
    }
  };

  const {
    onDelegate,
    onRevoke,
    isLoading: isActionLoading,
    packageWarningDialog,
    revokeConfirmationDialog,
  } = useAccessPackageActions({
    snackbarBusy: isFetching,
    onDelegateSuccess: () => {
      modalRef.current?.showSuccess();
    },
    onRevokeSuccess: () => {
      modalRef.current?.showSuccess();
    },
    onDelegateError: handleActionError,
    onRevokeError: handleActionError,
  });

  const handleOnDelegate = (user: UserActionTarget) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      actionTargetRef.current = user;
      onDelegate(accessPackage, toParty);
    }
  };

  const handleOnRevoke = (user: UserActionTarget) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      actionTargetRef.current = user;
      onRevoke(accessPackage, toParty);
    }
  };

  // Inline list actions move the row between the "with"/"without access" buckets (or remove it), so
  // arm focus restoration here only — once the data settles, focus follows the row by its id (or the
  // search field fallback). The modal path keeps focus in the dialog and restores to the list on close.
  const handleInlineRevoke = (user: UserActionTarget) => {
    requestFocusAfterListChange(user.id, USER_SEARCH_FALLBACK_ID);
    handleOnRevoke(user);
  };

  const handleInlineDelegate = (user: UserActionTarget) => {
    requestFocusAfterListChange(user.id, USER_SEARCH_FALLBACK_ID);
    handleOnDelegate(user);
  };

  const availableActions = [
    DelegationAction.REVOKE,
    ...(canDelegate ? [DelegationAction.DELEGATE] : []),
  ];

  return (
    <>
      <RestoreFocusFallback>
        {!isLoading && (
          <DsParagraph
            data-size='md'
            className={pageClasses.tabDescription}
          >
            {t('package_poa_details_page.users_tab.description')}
          </DsParagraph>
        )}

        <UserSearch
          includeSelfAsChild={false}
          restoreFocusFallbackId={USER_SEARCH_FALLBACK_ID}
          users={users}
          indirectUsers={indirectUsers}
          isLoading={
            isLoading ||
            loadingIndirectConnections ||
            roleMetadataIsLoading ||
            isDelegationCheckLoading
          }
          onDelegate={canDelegate ? handleInlineDelegate : undefined}
          AddUserButton={
            <AddPackageUserButton
              accessPackage={accessPackage}
              onUserAdded={handleUserAdded}
            />
          }
          onRevoke={handleInlineRevoke}
          onSelect={(user) => modalRef.current?.open(user)}
          isActionLoading={
            isActionLoading ||
            isLoading ||
            loadingIndirectConnections ||
            isFetching ||
            isFetchingIndirectConnections ||
            roleMetadataIsLoading ||
            isDelegationCheckLoading
          }
          canDelegate={canDelegate}
        />
      </RestoreFocusFallback>

      <PackageUserModal
        ref={modalRef}
        accessPackage={accessPackage}
        availableActions={availableActions}
        isActionLoading={isActionLoading}
        isFetching={isFetching}
        onDelegate={handleOnDelegate}
        onRevoke={handleOnRevoke}
        onClosed={(user) => restoreFocus?.requestFocus(user.id, USER_SEARCH_FALLBACK_ID)}
      />
      {packageWarningDialog}
      {revokeConfirmationDialog}
    </>
  );
};

export default UsersTab;
