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
}: GetInheritedStatusParams): InheritedStatusMessageType | undefined => {
  if (!permissions || permissions.length === 0) {
    return undefined;
  }

  const relevantPermission = permissions.find(
    (permission) => !toParty?.partyUuid || permission.to?.id === toParty.partyUuid,
  );
  const hasRightholderRole = permissions.some(
    (permission) => permission.role?.code === 'rettighetshaver',
  );

  if (!relevantPermission) {
    return undefined;
  }

  return resolveInheritanceStatus(relevantPermission, hasRightholderRole) ?? undefined;
};

export const useInheritedStatusInfo = (params: GetInheritedStatusParams) =>
  getInheritedStatus(params);
