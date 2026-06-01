import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  DsParagraph,
  type Color,
  type UserListItemProps,
} from '@altinn/altinn-components';

import type { Client } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import {
  getFormattedDateOfBirthLabel,
  formatOrgNr,
  isSubUnitByType,
} from '@/resources/utils/reporteeUtils';

import { buildClientParentNameById, buildClientSortKey } from '../clientSortUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { AccessPackageListItems } from '../AccessPackageListItems/AccessPackageListItems';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import { usePackageAccessControls } from '../AccessInfoModal/usePackageAccessControls';

export type ClientAccessPackageAction = {
  clientId: string;
  roleCode: string;
  packageId: string;
  accessPackageName: string;
};

type ClientAccessListProps = {
  clients: Client[];
  accessStateClients?: Client[];
  addDisabled?: boolean;
  removeDisabled?: boolean;
  onAddAccessPackage?: (action: ClientAccessPackageAction) => void;
  onRemoveAccessPackage?: (action: ClientAccessPackageAction) => void;
  searchPlaceholder?: string;
  requireDelegableForActions?: boolean;
  emptyAccessText?: string;
};

const getUserListItemType = (clientType: string): UserListItemProps['type'] => {
  return clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

export const ClientAccessList = ({
  clients,
  accessStateClients,
  addDisabled = false,
  removeDisabled = false,
  onAddAccessPackage,
  onRemoveAccessPackage,
  searchPlaceholder,
  requireDelegableForActions = true,
  emptyAccessText,
}: ClientAccessListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const { getItemActionProps, modal } = usePackageAccessControls();
  const clientsForAccessState = accessStateClients ?? clients;
  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
    const clientName = client.client.name;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);

    const nodes = client.access.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = clientsForAccessState.some((aap) => {
          return (
            aap.client.id === clientId &&
            aap.access.some((p) => p.packages.some((ap) => ap.id === pkg.id))
          );
        });
        const accessPackage = getAccessPackageById(pkg.id);
        const actionIsDelegable = accessPackage?.isDelegable ?? false;
        const showAction = !requireDelegableForActions || actionIsDelegable;
        const packageName = accessPackage?.name || pkg.name;
        const isViaRole = access.role.code !== 'rettighetshaver';
        const canAct =
          showAction &&
          ((hasAccess && !!onRemoveAccessPackage) || (!hasAccess && !!onAddAccessPackage));
        const action: ClientAccessPackageAction = {
          clientId,
          roleCode: access.role.code,
          packageId: pkg.urn ?? '',
          accessPackageName: packageName,
        };

        return {
          id: pkg.id,
          name: packageName,
          type: userType,
          isSubUnit,
          titleAs: 'h3',
          description: isViaRole
            ? t('client_administration_page.via_role', { role: roleName })
            : '',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          ...getItemActionProps({
            packageName,
            accessPackage,
            toPartyName: clientName,
            hasAccess,
            canAct,
            isViaRole,
            roleName,
            addDisabled,
            removeDisabled,
            onAdd: () => onAddAccessPackage?.(action),
            onRemove: () => onRemoveAccessPackage?.(action),
          }),
        };
      });

      if (packages) {
        acc.push(...packages.filter((pkg): pkg is AccessPackageListItemProps => pkg !== null));
      }

      return acc;
    }, [] as AccessPackageListItemProps[]);

    return {
      id: clientId,
      name: clientName,
      organizationIdentifier: client.client.organizationIdentifier,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      as: 'button',
      titleAs: 'h2',
      children:
        nodes.length === 0 && emptyAccessText ? (
          <DsParagraph>{emptyAccessText}</DsParagraph>
        ) : (
          <AccessPackageListItems items={nodes} />
        ),
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: formatOrgNr(client.client.organizationIdentifier),
            })
          : userType === 'person'
            ? getFormattedDateOfBirthLabel(client.client.dateOfBirth)
            : undefined,
    };
  });

  return (
    <>
      <UserListItems
        items={userListItems}
        searchPlaceholder={searchPlaceholder}
      />
      {modal}
    </>
  );
};
