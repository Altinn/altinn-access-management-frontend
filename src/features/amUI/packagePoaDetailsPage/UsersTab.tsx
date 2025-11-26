import { useMemo } from 'react';

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

const mapUserToParty = (user: User): Party => ({
  partyId: 0,
  partyUuid: user.id,
  name: user.name,
  partyTypeName: user.variant === 'organization' ? PartyType.Organization : PartyType.Person,
});

interface UsersTabProps {
  accessPackage?: AccessPackage;
  fromParty?: { partyUuid?: string; name?: string } | null;
  isLoading: boolean;
  isFetching: boolean;
  canDelegate?: boolean;
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
  const {
    mapRoles,
    isLoading: loadingRoleMetadata,
    isError: roleMetadataError,
  } = useRoleMetadata();
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
  const connectionsWithRoles = useMemo(
    () =>
      connections.map((connection) => ({
        ...connection,
        roles: loadingRoleMetadata || roleMetadataError ? [] : mapRoles(connection.roles),
        connections: connection.connections?.map((child) => ({
          ...child,
          roles: loadingRoleMetadata || roleMetadataError ? [] : mapRoles(child.roles),
        })),
      })),
    [connections, mapRoles, loadingRoleMetadata, roleMetadataError],
  );

  const onDelegateSuccess = (p: AccessPackage, toParty: Party) => {
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

  const {
    onDelegate,
    onRevoke,
    isLoading: isActionLoading,
  } = useAccessPackageActions({ onDelegateSuccess, onRevokeSuccess });

  const handleOnDelegate = (user: User) => {
    const toParty = mapUserToParty(user);
    if (accessPackage && toParty) {
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

      <AdvancedUserSearch
        connections={connectionsWithRoles}
        indirectConnections={indirectConnections}
        isLoading={isLoading || loadingIndirectConnections || loadingRoleMetadata}
        onDelegate={canDelegate ? handleOnDelegate : undefined}
        onRevoke={handleOnRevoke}
        isActionLoading={
          isActionLoading ||
          isLoading ||
          loadingIndirectConnections ||
          isFetching ||
          isFetchingIndirectConnections ||
          loadingRoleMetadata
        }
        canDelegate={canDelegate}
      />
    </>
  );
};

export default UsersTab;
