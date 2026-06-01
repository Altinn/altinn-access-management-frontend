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
import { getInheritedStatus, isPermissionInherited } from '../common/useInheritedStatus';
import { PartyInfoModal } from '../common/DelegationModal/Person/PartyInfoModal';

const mapUserToParty = (user: UserActionTarget): Party => ({
  partyId: 0,
  partyUuid: user.id,
  orgNumber: user.organizationIdentifier ?? undefined,
  name: user.name,
  partyTypeName:
    user.type?.toLowerCase() === 'organisasjon' ? PartyType.Organization : PartyType.Person,
  dateOfBirth: user.dateOfBirth ?? undefined,
  variant: user.variant ?? undefined,
});

interface UsersTabProps {
  accessPackage?: AccessPackage;
  isLoading: boolean;
  isFetching: boolean;
  onDelegateError?: (errorInfo: ActionError) => void;
}

export const UsersTab = ({ accessPackage, isLoading, isFetching }: UsersTabProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserActionTarget | null>(null);
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
    queueSnackbar(
      t('package_poa_details_page.package_delegation_success', {
        name: formatToPartyName(toParty),
        accessPackage: p?.name ?? '',
      }),
      'success',
    );
  };

  const onRevokeSuccess = (p: AccessPackage, toParty: Party) => {
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

  const availableActions = [
    DelegationAction.REVOKE,
    ...(canDelegate ? [DelegationAction.DELEGATE] : []),
  ];

  const selectedUserPermissions = useMemo(
    () =>
      accessPackage?.permissions?.filter((permission) => permission.to?.id === selectedUser?.id) ??
      [],
    [accessPackage?.permissions, selectedUser?.id],
  );

  const selectedUserHasDirectAccess = selectedUserPermissions.some(
    (permission) => !isPermissionInherited(permission),
  );

  const selectedUserInheritedStatus = useMemo(
    () =>
      getInheritedStatus({
        permissions: selectedUserPermissions,
        toParty: selectedUser ? mapUserToParty(selectedUser) : undefined,
        fromParty,
      }),
    [selectedUserPermissions, selectedUser, fromParty],
  );

  const handleSelectUser = (user: UserActionTarget) => {
    setSelectedUser(user);
    modalRef.current?.showModal();
  };

  return (
    <>
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
        users={users}
        indirectUsers={indirectUsers}
        isLoading={
          isLoading ||
          loadingIndirectConnections ||
          roleMetadataIsLoading ||
          isDelegationCheckLoading
        }
        onDelegate={canDelegate ? handleOnDelegate : undefined}
        onAddNewUser={canDelegate ? handleOnDelegate : undefined}
        onRevoke={handleOnRevoke}
        onSelect={handleSelectUser}
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

      <PartyInfoModal
        ref={modalRef}
        availableActions={availableActions}
        partyInfo={
          selectedUser && accessPackage
            ? {
                party: mapUserToParty(selectedUser),
                accessPackage,
                userHasAccess: selectedUserHasDirectAccess,
                inheritedStatus: selectedUserInheritedStatus,
                onDelegate: () => {
                  handleOnDelegate(selectedUser);
                  modalRef.current?.close();
                },
                onRevoke: () => {
                  handleOnRevoke(selectedUser);
                  modalRef.current?.close();
                },
              }
            : undefined
        }
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
};

export default UsersTab;
