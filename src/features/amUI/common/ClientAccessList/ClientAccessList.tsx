import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getFormattedDateOfBirthLabel,
  formatEntityDisplayName,
  formatOrgNr,
  isSubUnitByType,
  getAvatarType,
} from '@/resources/utils/reporteeUtils';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type { Client } from '@/rtk/features/clientApi';

import { buildClientParentNameById, buildClientSortKey } from '../clientSortUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { indexHeldAccess } from '../ClientBulkDelegation/getClientBulkItems';
import type {
  ClientAccessEntry,
  ClientAccessRecipient,
  RunClientAccessAction,
} from '../ClientAccess/clientAccessEntry';
import { ClientAccessRows, type ClientAccessRow } from '../ClientAccess/ClientAccessRows';

type ClientAccessListProps = {
  clients: Client[];
  accessStateClients?: Client[];
  resourceAccessClients?: Client[];
  /** The agent whose access to the clients is listed. */
  recipient: ClientAccessRecipient;
  runAction: RunClientAccessAction;
  canDelegate?: boolean;
  addDisabled?: boolean;
  removeDisabled?: boolean;
  renderClientActions?: (client: Client, restoreFocusFallbackId?: string) => React.ReactNode;
  requireDelegableForActions?: boolean;
  emptyAccessText?: string;
  emptyText?: string;
  searchString?: string;
  expandedIds?: string[];
  onToggleExpanded?: (id: string) => void;
  // Focus target when the acted-on row is no longer reachable here, typically the section heading.
  restoreFocusFallbackId?: string;
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

/** The agent-side list: one row per client, each showing that client's access for the agent. */
export const ClientAccessList = ({
  clients,
  accessStateClients,
  resourceAccessClients,
  recipient,
  runAction,
  canDelegate,
  addDisabled,
  removeDisabled,
  renderClientActions,
  requireDelegableForActions = true,
  emptyAccessText,
  emptyText,
  searchString,
  expandedIds,
  onToggleExpanded,
  restoreFocusFallbackId,
}: ClientAccessListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageByUrn } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();

  const packageAccessClients = accessStateClients ?? clients;
  const heldPackages = useMemo(
    () => indexHeldAccess(packageAccessClients, (held) => held.client.id),
    [packageAccessClients],
  );
  const heldResources = useMemo(
    () => indexHeldAccess(resourceAccessClients ?? packageAccessClients, (held) => held.client.id),
    [resourceAccessClients, packageAccessClients],
  );

  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const buildEntries = (client: Client) =>
    client.access.flatMap<ClientAccessEntry>((access) => {
      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const shared = { clientId: client.client.id, recipient, roleCode: access.role.code };

      const packages = access.packages.flatMap<ClientAccessEntry>((pkg) => {
        // The client endpoints only send the package id and urn, so a package we can't look up has
        // no name or resources to show.
        const accessPackage = getAccessPackageByUrn(pkg.urn);
        if (!accessPackage) return [];
        return {
          ...shared,
          kind: 'package',
          itemId: `${client.client.id}:${access.role.code}:${pkg.id}`,
          accessId: pkg.urn,
          accessPackage,
          roleDescription:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : undefined,
          canAct: !requireDelegableForActions || (accessPackage.isDelegable ?? false),
        };
      });

      const resources = (access.resources ?? []).flatMap<ClientAccessEntry>((clientResource) => {
        const resource = clientResource.details;
        if (!resource) return [];
        return {
          ...shared,
          kind: 'resource',
          itemId: `${client.client.id}:${access.role.code}:${clientResource.refId}`,
          accessId: clientResource.refId,
          resource,
          canAct: !requireDelegableForActions || resource.delegable,
        };
      });

      return [...packages, ...resources];
    });

  const rows: ClientAccessRow[] = sortedClients.map((client) => {
    const userType = getAvatarType(client.client);
    return {
      id: client.client.id,
      name: formatEntityDisplayName(client.client),
      organizationIdentifier: client.client.organizationIdentifier ?? undefined,
      type: userType,
      subUnit: isSubUnitByType(client.client.unitType),
      deleted: client.client.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      as: 'button',
      titleAs: 'div',
      entries: buildEntries(client),
      actions: renderClientActions?.(client, restoreFocusFallbackId),
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
    <ClientAccessRows
      rows={rows}
      heldPackages={heldPackages}
      heldResources={heldResources}
      heldBy='client'
      runAction={runAction}
      canDelegate={canDelegate}
      addDisabled={addDisabled}
      removeDisabled={removeDisabled}
      emptyText={emptyText}
      emptyAccessText={emptyAccessText}
      searchString={searchString}
      expandedIds={expandedIds}
      onToggleExpanded={onToggleExpanded}
      restoreFocusFallbackId={restoreFocusFallbackId}
    />
  );
};
