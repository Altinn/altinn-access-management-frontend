import { useMemo } from 'react';
import pageClasses from './PackagePoaDetailsPage.module.css';
import { DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import {
  type Connection,
  type User,
  useGetRightHoldersQuery,
  ExtendedUser,
  PartyType,
} from '@/rtk/features/userInfoApi';
import { Party } from '@/rtk/features/lookupApi';
import { CompactRole } from '@/dataObjects/dtos/Common';
import AdvancedUserSearch from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useAccessPackageActions } from '../common/AccessPackageList/useAccessPackageActions';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { usePackagePermissionConnections } from './usePackagePermissionConnections';

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
}

export const UsersTab = ({ accessPackage, fromParty, isLoading, isFetching }: UsersTabProps) => {
  const { t } = useTranslation();

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

  const { onDelegate, onRevoke, isLoading: isActionLoading } = useAccessPackageActions({});

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

  if (connections.length === 0 && !isLoading) {
    return (
      <DsParagraph
        data-size='md'
        className={pageClasses.tabDescription}
      >
        {t('package_poa_details_page.users_tab.no_users', {
          fromparty: fromParty?.name,
        })}
      </DsParagraph>
    );
  }

  return (
    <>
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
        connections={connections}
        indirectConnections={indirectConnections}
        isLoading={isLoading || loadingIndirectConnections}
        onDelegate={handleOnDelegate}
        onRevoke={handleOnRevoke}
        isActionLoading={
          isActionLoading ||
          isLoading ||
          loadingIndirectConnections ||
          isFetching ||
          isFetchingIndirectConnections
        }
      />
    </>
  );
};

export default UsersTab;
