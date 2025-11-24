import type { Party } from '@/rtk/features/lookupApi';
import type { Entity } from '@/dataObjects/dtos/Common';

export enum InheritedStatusType {
  ViaRole = 'via_role',
  ViaParent = 'via_parent',
  ViaAgent = 'via_agent',
}

export interface InheritedStatusMessageType {
  type: InheritedStatusType;
  via?: Entity;
}

export type PermissionWithInheritance = {
  via?: Entity | null;
  viaRole?: { id: string } | null;
  to?: { id: string } | null;
  from?: { id: string } | null;
};

const resolveInheritanceStatus = (
  permission: PermissionWithInheritance,
  isActingTo: boolean,
  isActingFrom: boolean,
): InheritedStatusMessageType | null => {
  if (!permission.via) {
    return null;
  }
  if (permission.viaRole) {
    return {
      type: InheritedStatusType.ViaRole,
      via: permission.via,
    };
  }
  if (isActingTo) {
    return {
      type: InheritedStatusType.ViaParent,
      via: permission.via,
    };
  }
  if (isActingFrom) {
    return {
      type: InheritedStatusType.ViaAgent,
      via: permission.via,
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
  fromParty,
  actingParty,
}: GetInheritedStatusParams): InheritedStatusMessageType | undefined => {
  if (!permissions || permissions.length === 0) {
    return undefined;
  }

  const relevantPermission = permissions.find(
    (permission) => !toParty?.partyUuid || permission.to?.id === toParty.partyUuid,
  );

  if (!relevantPermission) {
    return undefined;
  }

  const isActingTo = !!actingParty?.partyUuid && actingParty.partyUuid === toParty?.partyUuid;
  const isActingFrom = !!actingParty?.partyUuid && actingParty.partyUuid === fromParty?.partyUuid;

  return resolveInheritanceStatus(relevantPermission, isActingTo, isActingFrom) ?? undefined;
};

export const useInheritedStatusInfo = (params: GetInheritedStatusParams) =>
  getInheritedStatus(params);
