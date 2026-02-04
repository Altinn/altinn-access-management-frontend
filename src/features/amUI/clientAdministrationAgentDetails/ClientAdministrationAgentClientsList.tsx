import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  Button,
  type UserListItemProps,
  type Color,
  formatDate,
  formatDisplayName,
} from '@altinn/altinn-components';
import type { Client } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';

import { useClientAdministrationAccessPackageActions } from '../clientAdministration/useClientAdministrationAccessPackageActions';
import { UserListItems, type UserListItemData } from './UserListItems';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { AccessPackageListItems } from './AccessPackageListItems';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';

type ClientAdministrationAgentClientsListProps = {
  clients: Client[];
  agentAccessPackages: Client[];
  isLoading: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
};

const getUserListItemType = (clientType: string): UserListItemProps['type'] => {
  return clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

export const ClientAdministrationAgentClientsList = ({
  clients,
  agentAccessPackages,
  isLoading,
  toPartyUuid,
  actingPartyUuid,
}: ClientAdministrationAgentClientsListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();

  const { addAccessPackage: addAgentAccessPackage, removeAccessPackage: removeAgentAccessPackage } =
    useClientAdministrationAccessPackageActions();

  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);
  const { toParty } = usePartyRepresentation();
  const agentName = formatDisplayName({
    fullName: toParty?.name || '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);

    const nodes = client.access.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = agentAccessPackages.some((aap) => {
          return (
            aap.client.id === clientId &&
            aap.access.some((p) => p.packages.some((ap) => ap.id === pkg.id))
          );
        });
        const accessPackage = getAccessPackageById(pkg.id);
        const delegable = accessPackage?.isDelegable ?? false;
        return {
          id: pkg.id,
          name: accessPackage?.name || pkg.name,
          type: client.client.type.toLowerCase() === 'organisasjon' ? 'company' : 'person',
          isSubUnit,
          interactive: false,
          description:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : '',
          as: 'div',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          controls:
            delegable &&
            (hasAccess ? (
              <Button
                variant='tertiary'
                disabled={isLoading}
                onClick={() => {
                  removeAgentAccessPackage({
                    roleCode: access.role.code,
                    packageId: pkg.urn ?? '',
                    agentName: agentName,
                    accessPackageName: accessPackage?.name || pkg.name,
                    fromPartyUuid: clientId,
                    toPartyUuid,
                    actingPartyUuid,
                  });
                }}
              >
                <MinusCircleIcon />
                {t('client_administration_page.remove_package_button')}
              </Button>
            ) : (
              <Button
                variant='tertiary'
                disabled={isLoading}
                onClick={() => {
                  addAgentAccessPackage({
                    roleCode: access.role.code,
                    packageId: pkg.urn ?? '',
                    agentName: agentName,
                    accessPackageName: accessPackage?.name || pkg.name,
                    fromPartyUuid: clientId,
                    toPartyUuid,
                    actingPartyUuid,
                  });
                }}
              >
                <PlusCircleIcon />
                {t('client_administration_page.delegate_package_button')}
              </Button>
            )),
        };
      });

      if (packages) {
        acc.push(...packages.filter((pkg): pkg is AccessPackageListItemProps => pkg !== null));
      }

      return acc;
    }, [] as AccessPackageListItemProps[]);

    return {
      id: clientId,
      name: client.client.name,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted,
      collapsible: true,
      as: Button,
      children: <AccessPackageListItems items={nodes} />,
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: client.client.organizationIdentifier,
            })
          : userType === 'person'
            ? `${t('common.date_of_birth')} ${formatDate(client.client.dateOfBirth ?? '')}`
            : undefined,
    };
  });

  return <UserListItems items={userListItems} />;
};
