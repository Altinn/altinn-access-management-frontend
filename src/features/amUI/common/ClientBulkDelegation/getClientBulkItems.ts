import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ClientAccess } from '@/rtk/features/clientApi';

export type ClientBulkItem = {
  kind: 'package' | 'resource';
  roleCode: string;
  id: string;
};

export type ClientBulkItems = { missing: ClientBulkItem[]; held: ClientBulkItem[] };

// Keyed by client on the agent page and by agent on the client page.
export type HeldAccessByRow = Map<string, ClientAccess[]>;

export const indexHeldAccess = <T extends { access: ClientAccess[] }>(
  entries: T[],
  getRowId: (entry: T) => string,
): HeldAccessByRow => {
  const byRow: HeldAccessByRow = new Map();
  entries.forEach((entry) => {
    const rowId = getRowId(entry);
    byRow.set(rowId, [...(byRow.get(rowId) ?? []), ...entry.access]);
  });
  return byRow;
};

type GetClientBulkItemsParams = {
  offered: ClientAccess[];
  heldPackages: ClientAccess[];
  heldResources: ClientAccess[];
  getAccessPackageByUrn: (packageUrn?: string | null) => AccessPackage | undefined;
};

const heldRolesById = (accesses: ClientAccess[], pick: (access: ClientAccess) => string[]) => {
  const roles = new Map<string, string[]>();
  accesses.forEach((access) =>
    pick(access).forEach((id) => {
      const existing = roles.get(id);
      if (!existing) {
        roles.set(id, [access.role.code]);
      } else if (!existing.includes(access.role.code)) {
        existing.push(access.role.code);
      }
    }),
  );
  return roles;
};

export const getClientBulkItems = ({
  offered,
  heldPackages,
  heldResources,
  getAccessPackageByUrn,
}: GetClientBulkItemsParams): ClientBulkItems => {
  const heldPackageRoles = heldRolesById(heldPackages, (access) =>
    access.packages.map((pkg) => pkg.id),
  );
  const heldResourceRoles = heldRolesById(heldResources, (access) =>
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

  offered.forEach((access) => {
    access.packages.forEach((pkg) => {
      const accessPackage = getAccessPackageByUrn(pkg.urn);
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
