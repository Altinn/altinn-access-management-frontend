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

interface UsersTabProps {
  accessPackage?: AccessPackage;
  isLoading: boolean;
  isFetching: boolean;
  onDelegateError?: (errorInfo: ActionError) => void;
}

export const UsersTab = ({ accessPackage, isLoading, isFetching }: UsersTabProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty } = usePartyRepresentation();
  const modalRef = useRef<PackageUserModalHandle>(null);
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

  const availableActions = [
    DelegationAction.REVOKE,
    ...(canDelegate ? [DelegationAction.DELEGATE] : []),
  ];

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
        AddUserButton={
          <NewUserButton
            variant='primary'
            onComplete={handleOnDelegate}
          />
        }
        onRevoke={handleOnRevoke}
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

      <PackageUserModal
        ref={modalRef}
        accessPackage={accessPackage}
        availableActions={availableActions}
        isActionLoading={isActionLoading}
        onDelegate={handleOnDelegate}
        onRevoke={handleOnRevoke}
      />
    </>
  );
};

export default UsersTab;
