import { useEffect, useRef, useState } from 'react';
import { DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { Party } from '@/rtk/features/lookupApi';
import { PartyType, type User } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { Permissions } from '@/dataObjects/dtos/accessPackage';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import AdvancedUserSearch from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';
import {
  PartyRepresentationContext,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { usePermissionConnections } from '../common/PermissionConnections/usePermissionConnections';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';

const mapUserToParty = (user: User): Party => ({
  partyId: 0,
  partyUuid: user.id,
  name: user.name,
  partyTypeName:
    user.type?.toLowerCase() === 'organisasjon' ? PartyType.Organization : PartyType.Person,
});

interface ServiceUsersTabProps {
  resource?: ServiceResource;
  permissions: Permissions[];
  isLoading: boolean;
  isFetching: boolean;
}

export const ServiceUsersTab = ({
  resource,
  permissions,
  isLoading,
  isFetching,
}: ServiceUsersTabProps) => {
  const { t } = useTranslation();
  const { fromParty, actingParty } = usePartyRepresentation();
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const { isLoading: roleMetadataIsLoading } = useRoleMetadata();
  const connections = usePermissionConnections(permissions);
  const canDelegate = resource?.delegable !== false;

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

  useEffect(() => {
    if (selectedParty) {
      modalRef.current?.showModal();
    }
  }, [selectedParty]);

  const openDelegationModalForUser = (user: User) => {
    if (!resource) {
      return;
    }

    setSelectedParty(mapUserToParty(user));
  };

  return (
    <>
      {!isLoading && (
        <DsParagraph data-size='md'>
          {t('service_poa_details_page.users_tab.description')}
        </DsParagraph>
      )}

      <AdvancedUserSearch
        includeSelfAsChild={false}
        connections={connections}
        indirectConnections={indirectConnections}
        isLoading={isLoading || loadingIndirectConnections || roleMetadataIsLoading}
        onDelegate={canDelegate ? openDelegationModalForUser : undefined}
        onAddNewUser={canDelegate ? openDelegationModalForUser : undefined}
        onRevoke={openDelegationModalForUser}
        isActionLoading={
          isLoading ||
          loadingIndirectConnections ||
          isFetching ||
          isFetchingIndirectConnections ||
          roleMetadataIsLoading
        }
        canDelegate={canDelegate}
        noUsersText={t('service_poa_details_page.users_tab.no_users', {
          fromparty: formatDisplayName({
            fullName: fromParty?.name ?? '',
            type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
          }),
        })}
      />

      {selectedParty && resource && fromParty && actingParty && (
        <PartyRepresentationContext.Provider
          value={{
            fromParty,
            toParty: selectedParty,
            actingParty,
            selfParty: undefined,
            isLoading: false,
            isError: false,
          }}
        >
          <DelegationModalProvider>
            <EditModal
              ref={modalRef}
              resource={resource}
              availableActions={[
                DelegationAction.REVOKE,
                ...(canDelegate ? [DelegationAction.DELEGATE] : []),
              ]}
              onClose={() => setSelectedParty(null)}
            />
          </DelegationModalProvider>
        </PartyRepresentationContext.Provider>
      )}
    </>
  );
};
