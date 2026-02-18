import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  Button,
  DsParagraph,
  type Color,
  formatDate,
  type UserListItemProps,
} from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type { Client } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

import { buildClientParentNameById, buildClientSortKey } from '../clientSortUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { AccessPackageListItems } from '../AccessPackageListItems/AccessPackageListItems';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';

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
  const clientsForAccessState = accessStateClients ?? clients;
  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
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

        let controls: React.ReactNode;
        if (showAction && hasAccess && onRemoveAccessPackage) {
          controls = (
            <Button
              variant='tertiary'
              disabled={removeDisabled}
              onClick={() => {
                onRemoveAccessPackage({
                  clientId,
                  roleCode: access.role.code,
                  packageId: pkg.urn ?? '',
                  accessPackageName: accessPackage?.name || pkg.name,
                });
              }}
            >
              <MinusCircleIcon />
              {t('client_administration_page.remove_package_button')}
            </Button>
          );
        } else if (showAction && !hasAccess && onAddAccessPackage) {
          controls = (
            <Button
              variant='tertiary'
              disabled={addDisabled}
              onClick={() => {
                onAddAccessPackage({
                  clientId,
                  roleCode: access.role.code,
                  packageId: pkg.urn ?? '',
                  accessPackageName: accessPackage?.name || pkg.name,
                });
              }}
            >
              <PlusCircleIcon />
              {t('client_administration_page.delegate_package_button')}
            </Button>
          );
        }

        return {
          id: pkg.id,
          name: accessPackage?.name || pkg.name,
          type: userType,
          isSubUnit,
          interactive: false,
          description:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : '',
          as: 'div',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          controls,
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
      organizationIdentifier: client.client.organizationIdentifier,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted,
      collapsible: true,
      as: Button,
      children:
        nodes.length > 0 ? (
          <AccessPackageListItems items={nodes} />
        ) : emptyAccessText ? (
          <DsParagraph>{emptyAccessText}</DsParagraph>
        ) : (
          <AccessPackageListItems items={nodes} />
        ),
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

  return (
    <UserListItems
      items={userListItems}
      searchPlaceholder={searchPlaceholder}
    />
  );
};
