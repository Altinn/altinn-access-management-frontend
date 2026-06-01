import type { Party } from '@/rtk/features/lookupApi';
import type { Entity } from '@/dataObjects/dtos/Common';
import type { Permission } from '@/rtk/features/roleApi';

export enum InheritedStatusType {
  ViaRole = 'via_role',
  ViaConnection = 'via_connection',
  ViaKeyRole = 'via_keyrole',
  ViaER = 'via_er',
}

export interface InheritedStatusMessageType {
  type: InheritedStatusType;
  via?: Entity;
}

const resolveInheritanceStatus = (
  permission: Permission,
  hasRightholderRole: boolean,
): InheritedStatusMessageType | null => {
  if (permission.viaRole && permission.via) {
    return {
      type: InheritedStatusType.ViaRole,
      via: permission.via,
    };
  }
  if (permission.via) {
    return {
      type: InheritedStatusType.ViaConnection,
      via: permission.via,
    };
  }
  if (permission.reason?.items.some((r) => r.name === 'rolemap') && permission.from) {
    return {
      type: InheritedStatusType.ViaER,
      via: permission.from,
    };
  }
  if (
    !permission.via &&
    !permission.viaRole &&
    !hasRightholderRole &&
    permission.from &&
    permission.reason?.items.some((r) => r.name !== 'direct')
  ) {
    return {
      type: InheritedStatusType.ViaKeyRole,
      via: permission.from,
    };
  }

  return null;
};

export const isPermissionInherited = (permission: Permission): boolean =>
  resolveInheritanceStatus(permission, permission.role?.code === 'rettighetshaver') !== null;

interface GetInheritedStatusParams {
  permissions?: Permission[];
  toParty?: Party;
  fromParty?: Party;
  actingParty?: Party;
}

export const getInheritedStatus = ({
  permissions,
  toParty,
  fromParty: _fromParty,
  actingParty: _actingParty,
}: GetInheritedStatusParams): InheritedStatusMessageType[] => {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  const result: InheritedStatusMessageType[] = [];

  permissions.forEach((permission) => {
    const isRelevantPermission = !toParty?.partyUuid || permission.to?.id === toParty.partyUuid;

    if (isRelevantPermission) {
      const hasRightholderRole = permission.role?.code === 'rettighetshaver';
      const status = resolveInheritanceStatus(permission, hasRightholderRole);
      if (status) {
        result.push(status);
      }
    }
  });

  return result;
};

export const useInheritedStatusInfo = (params: GetInheritedStatusParams) =>
  getInheritedStatus(params);
