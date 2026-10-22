import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { RoleInfo } from '@/rtk/features/connectionApi';

export interface UserSearchNode extends Pick<
  PartyEntity,
  'id' | 'name' | 'type' | 'unitType' | 'organizationIdentifier' | 'dateOfBirth'
> {
  children: UserSearchNode[] | null;
  roles: RoleInfo[];
  sortKey?: string;
  addedAt?: string;
  isDeleted?: boolean;
  isInherited?: boolean;
  matchInChildren?: boolean;
}

export type UserActionTarget = Pick<
  UserSearchNode,
  'id' | 'name' | 'type' | 'unitType' | 'organizationIdentifier' | 'dateOfBirth' | 'isInherited'
>;
