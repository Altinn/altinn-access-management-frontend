import { useMemo, useRef, useState } from 'react';

import pageClasses from './PackagePoaDetailsPage.module.css';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { Party } from '@/rtk/features/lookupApi';
import UserSearch from '../common/UserSearch/UserSearch';
import { useAccessPackageActions } from '../common/AccessPackageList/useAccessPackageActions';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';
import { ActionError } from '@/resources/hooks/useActionError';
import { DelegateErrorAlert } from './DelegateErrorAlert';
import { useAccessPackageDelegationCheck } from '../common/DelegationCheck/AccessPackageDelegationCheckContext';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import type { UserActionTarget } from '../common/UserSearch/types';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { PackageUserModal, mapUserToParty, type PackageUserModalHandle } from './PackageUserModal';
import { NewUserButton } from '../users/NewUserModal/NewUserModal';
import {
  RestoreFocusFallback,
  useRestoreFocusContext,
  useRestoreFocusOnDataChange,
} from '../common/RestoreFocus';

interface UsersTabProps {
  accessPackage?: AccessPackage;
  isLoading: boolean;
  isFetching: boolean;
  onDelegateError?: (errorInfo: ActionError) => void;
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
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isFetching, showPendingOnUnmount: true });
  const { canDelegatePackage, isLoading: isDelegationCheckLoading } =
    useAccessPackageDelegationCheck();
  const canDelegate = accessPackage?.id
    ? canDelegatePackage(accessPackage.id)?.result !== false
    : true;

  const [delegateActionError, setDelegateActionError] = useState<{
    error: ActionError;
    targetParty?: Party;
  } | null>(null);

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

  const formatToPartyName = (party: Party) => {
    return formatDisplayName({
      fullName: party.name,
      type: party?.partyTypeName === PartyType.Person ? 'person' : 'company',
    });
  };

  const onDelegateSuccess = (p: AccessPackage, toParty: Party) => {
    setDelegateActionError(null);
    modalRef.current?.showSuccess();
    queueSnackbar(
      t('package_poa_details_page.package_delegation_success', {
        name: formatToPartyName(toParty),
        accessPackage: p?.name ?? '',
      }),
      'success',
    );
  };

  const onRevokeSuccess = (p: AccessPackage, toParty: Party) => {
    modalRef.current?.showSuccess();
    queueSnackbar(
      t('package_poa_details_page.package_revocation_success', {
        name: formatToPartyName(toParty),
        accessPackage: p?.name ?? '',
      }),
      'success',
    );
  };

  const handleDelegateError = (
    _accessPackage: AccessPackage,
    errorInfo: ActionError,
    toParty?: Party,
  ) => {
    setDelegateActionError({ error: errorInfo, targetParty: toParty });
  };

  const {
    onDelegate,
    onRevoke,
    isLoading: isActionLoading,
  } = useAccessPackageActions({
    onDelegateSuccess,
    onRevokeSuccess,
    onDelegateError: handleDelegateError,
  });

  const handleOnDelegate = (user: UserActionTarget) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      setDelegateActionError(null);
      onDelegate(accessPackage, toParty);
    }
  };

  const handleOnRevoke = (user: UserActionTarget) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
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

        {delegateActionError?.error && delegateActionError?.targetParty && (
          <DelegateErrorAlert
            error={delegateActionError?.error}
            targetParty={delegateActionError?.targetParty}
            onClose={() => setDelegateActionError(null)}
          />
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
            <NewUserButton
              variant='primary'
              onComplete={handleOnDelegate}
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
    </>
  );
};

export default UsersTab;
