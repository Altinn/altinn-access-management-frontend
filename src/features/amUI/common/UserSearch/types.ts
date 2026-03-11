import type { User } from '@/rtk/features/userInfoApi';
import type { RoleInfo } from '@/rtk/features/connectionApi';

export interface UserSearchNode {
  id: string;
  name: string;
  type?: string;
  variant?: string;
  children: UserSearchNode[] | null;
  roles: RoleInfo[];
  partyId?: User['partyId'];
  organizationIdentifier?: User['organizationIdentifier'];
  dateOfBirth?: User['dateOfBirth'];
  sortKey?: string;
  addedAt?: string;
  isDeleted?: boolean;
  isInherited?: boolean;
  matchInChildren?: boolean;
}

export type UserActionTarget = Pick<UserSearchNode, 'id' | 'name' | 'type'>;
