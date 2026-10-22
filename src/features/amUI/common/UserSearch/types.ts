import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { RoleInfo } from '@/rtk/features/connectionApi';

export interface UserSearchNode extends Pick<
  PartyEntity,
  'id' | 'name' | 'type' | 'unitType' | 'organizationIdentifier' | 'dateOfBirth' | 'isDeleted'
> {
  children: UserSearchNode[] | null;
  roles: RoleInfo[];
  sortKey?: string;
  addedAt?: string;
  isInherited?: boolean;
  matchInChildren?: boolean;
}

export type UserActionTarget = Pick<
  UserSearchNode,
  | 'id'
  | 'name'
  | 'type'
  | 'unitType'
  | 'organizationIdentifier'
  | 'dateOfBirth'
  | 'isDeleted'
  | 'isInherited'
>;
