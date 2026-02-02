import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import type { Client } from '@/rtk/features/clientApi';

export const buildClientParentNameById = (clients: Client[]): Map<string, string> => {
  const parentNameById = new Map<string, string>();
  clients.forEach((client) => {
    if (client.client?.id) {
      parentNameById.set(client.client.id, client.client.name);
    }
  });
  return parentNameById;
};

export const buildClientSortKey = (client: Client, parentNameById: Map<string, string>): string => {
  const parentId = client.client.parent?.id;
  const isSubUnit = Boolean(parentId) && isSubUnitByType(client.client.variant);
  const parentName =
    (parentId ? parentNameById.get(parentId) : undefined) ??
    client.client.parent?.name ??
    client.client.name;
  const groupName = isSubUnit ? parentName : client.client.name;
  const groupId = isSubUnit && parentId ? parentId : client.client.id;
  return `${groupName}|${groupId}|${isSubUnit ? '1' : '0'}|${client.client.name}`;
};
