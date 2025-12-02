import { useMemo, useState } from 'react';

import pageClasses from './PackagePoaDetailsPage.module.css';
import { DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { type User, PartyType } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { Party } from '@/rtk/features/lookupApi';
import AdvancedUserSearch from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAccessPackageActions } from '../common/AccessPackageList/useAccessPackageActions';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { usePackagePermissionConnections } from './usePackagePermissionConnections';
import { useSnackbarOnIdle } from '@/resources/hooks/useSnackbarOnIdle';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';
import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { ActionError } from '@/resources/hooks/useActionError';
import { DelegateErrorAlert } from './DelegateErrorAlert';

const mapUserToParty = (user: User): Party => ({
  partyId: 0,
  partyUuid: user.id,
  name: user.name,
  partyTypeName:
    user.type?.toLowerCase() === 'organisasjon' ? PartyType.Organization : PartyType.Person,
});

interface UsersTabProps {
  accessPackage?: AccessPackage;
  fromParty?: { partyUuid?: string; name?: string } | null;
  isLoading: boolean;
  isFetching: boolean;
  canDelegate?: boolean;
  onDelegateError?: (errorInfo: ActionError) => void;
}

export const UsersTab = ({
  accessPackage,
  fromParty,
  isLoading,
  isFetching,
  canDelegate = true,
}: UsersTabProps) => {
  const { t } = useTranslation();
  const { queueSnackbar } = useSnackbarOnIdle({ isBusy: isFetching, showPendingOnUnmount: true });

  const [delegateActionError, setDelegateActionError] = useState<{
    error: ActionError;
    targetParty?: Party;
  } | null>(null);

  const { mapRoles, isLoading: roleMetadataIsLoading } = useRoleMetadata();
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

  const connections = usePackagePermissionConnections(accessPackage);
  // console.log('connections: ', connections);
  const connectionsWithRoles = useMemo(
    () =>
      connections.map((connection) => ({
        ...connection,
        roles: mapRoles(connection.roles),
        connections: connection.connections?.map((child) => ({
          ...child,
          roles: mapRoles(child.roles),
        })),
      })),
    [connections, mapRoles],
  );

  const onDelegateSuccess = (p: AccessPackage, toParty: Party) => {
    setDelegateActionError(null);
    queueSnackbar(
      t('package_poa_details_page.package_delegation_success', {
        name: toParty.name,
        accessPackage: p?.name ?? '',
      }),
      'success',
    );
  };

  const onRevokeSuccess = (p: AccessPackage, toParty: Party) => {
    queueSnackbar(
      t('package_poa_details_page.package_revocation_success', {
        name: toParty.name,
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

  const handleOnDelegate = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      setDelegateActionError(null);
      onDelegate(accessPackage, toParty);
    }
  };

  const handleOnRevoke = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
      onRevoke(accessPackage, toParty);
    }
  };

  return (
    <>
      {connections.length === 0 && !isLoading && !loadingIndirectConnections && (
        <div className={pageClasses.noUsersAlert}>
          <ExclamationmarkTriangleFillIcon className={pageClasses.noUsersAlertIcon} />
          <DsParagraph
            data-size='sm'
            className={pageClasses.tabDescription}
          >
            {t('package_poa_details_page.users_tab.no_users', {
              fromparty: fromParty?.name,
            })}
          </DsParagraph>
        </div>
      )}
      {!isLoading && (
        <DsParagraph
          data-size='md'
          className={pageClasses.tabDescription}
        >
          {t('package_poa_details_page.users_tab.description', {
            fromparty: fromParty?.name,
          })}
        </DsParagraph>
      )}

      {delegateActionError?.error && delegateActionError?.targetParty && (
        <DelegateErrorAlert
          error={delegateActionError?.error}
          targetParty={delegateActionError?.targetParty}
          onClose={() => setDelegateActionError(null)}
        />
      )}

      <AdvancedUserSearch
        includeSelfAsChild={false}
        connections={connectionsWithRoles}
        indirectConnections={indirectConnections}
        isLoading={isLoading || loadingIndirectConnections || roleMetadataIsLoading}
        onDelegate={canDelegate ? handleOnDelegate : undefined}
        onRevoke={handleOnRevoke}
        isActionLoading={
          isActionLoading ||
          isLoading ||
          loadingIndirectConnections ||
          isFetching ||
          isFetchingIndirectConnections ||
          roleMetadataIsLoading
        }
        canDelegate={canDelegate}
      />
    </>
  );
};

export default UsersTab;
