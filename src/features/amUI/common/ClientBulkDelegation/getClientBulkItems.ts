import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Client } from '@/rtk/features/clientApi';

export type ClientBulkItem = {
  kind: 'package' | 'resource';
  roleCode: string;
  id: string;
};

export type ClientBulkItems = { missing: ClientBulkItem[]; held: ClientBulkItem[] };

type GetClientBulkItemsParams = {
  client: Client;
  accessStateClients: Client[];
  resourceAccessClients: Client[];
  getAccessPackageById: (packageId?: string | null) => AccessPackage | undefined;
};

// Maps each held access to every role it is actually delegated under. Revoking has to target those
// roles, not the role the client happens to offer the access under, and an access held under two
// roles needs one revoke per role.
const heldRolesForClient = (
  clients: Client[],
  clientId: string,
  pick: (access: Client['access'][number]) => string[],
) => {
  const roles = new Map<string, string[]>();
  clients
    .filter((held) => held.client.id === clientId)
    .forEach((held) =>
      held.access.forEach((access) =>
        pick(access).forEach((id) => {
          const existing = roles.get(id);
          if (!existing) {
            roles.set(id, [access.role.code]);
          } else if (!existing.includes(access.role.code)) {
            existing.push(access.role.code);
          }
        }),
      ),
    );
  return roles;
};

export const getClientBulkItems = ({
  client,
  accessStateClients,
  resourceAccessClients,
  getAccessPackageById,
}: GetClientBulkItemsParams): ClientBulkItems => {
  const clientId = client.client.id;
  const heldPackageRoles = heldRolesForClient(accessStateClients, clientId, (access) =>
    access.packages.map((pkg) => pkg.id),
  );
  const heldResourceRoles = heldRolesForClient(resourceAccessClients, clientId, (access) =>
    (access.resources ?? []).map((resource) => resource.refId),
  );
  const missing: ClientBulkItem[] = [];
  const held: ClientBulkItem[] = [];
  const seen = new Set<string>();

  const add = (
    kind: ClientBulkItem['kind'],
    id: string,
    offeredRoleCode: string,
    heldRoles?: string[],
  ) => {
    const key = `${kind}:${id}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (heldRoles) {
      heldRoles.forEach((roleCode) => held.push({ kind, roleCode, id }));
    } else {
      missing.push({ kind, roleCode: offeredRoleCode, id });
    }
  };

  client.access.forEach((access) => {
    access.packages.forEach((pkg) => {
      const accessPackage = getAccessPackageById(pkg.id);
      if (!accessPackage?.isDelegable || !pkg.urn) return;

      add('package', pkg.urn, access.role.code, heldPackageRoles.get(pkg.id));
    });

    (access.resources ?? []).forEach((clientResource) => {
      if (!clientResource.details?.delegable) return;

      add(
        'resource',
        clientResource.refId,
        access.role.code,
        heldResourceRoles.get(clientResource.refId),
      );
    });
  });

  return { missing, held };
};
