import type { Party } from '@/rtk/features/lookupApi';
import type { Entity } from '@/dataObjects/dtos/Common';

export enum InheritedStatusType {
  ViaRole = 'via_role',
  ViaConnection = 'via_connection',
  ViaKeyRole = 'via_keyrole',
}

export interface InheritedStatusMessageType {
  type: InheritedStatusType;
  via?: Entity;
}

export type PermissionWithInheritance = {
  via?: Entity | null;
  viaRole?: { id: string } | null;
  to?: { id: string } | null;
  from?: Entity | null;
  role?: { code?: string } | null;
};

const resolveInheritanceStatus = (
  permission: PermissionWithInheritance,
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
  if (!permission.via && !permission.viaRole && !hasRightholderRole && permission.from) {
    return {
      type: InheritedStatusType.ViaKeyRole,
      via: permission.from,
    };
  }
  return null;
};

interface GetInheritedStatusParams {
  permissions?: PermissionWithInheritance[];
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
