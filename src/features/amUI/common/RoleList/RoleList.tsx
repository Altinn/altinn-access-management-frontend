import type { Role } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { DelegationAction } from '../DelegationModal/EditModal';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import classes from './roleSection.module.css';
import { SkeletonRoleList } from './SkeletonRoleList';

interface RoleListProps {
  onSelect: (role: Role) => void;
  availableActions?: DelegationAction[];
  isLoading?: boolean;
  onActionError: (role: Role, error: ActionError) => void;
}

interface RoleListEntry {
  role: Role;
  revocation?: { from: string; to: string };
  hasDirectDelegation: boolean;
  hasInheritedDelegation: boolean;
  inheritedFrom?: string;
}

export const RoleList = ({
  onSelect,
  availableActions,
  isLoading,
  onActionError,
}: RoleListProps) => {
  const { fromParty, toParty, actingParty, isLoading: partyIsLoading } = usePartyRepresentation();
  const { data: roleConnections, isLoading: roleConnectionsIsLoading } = useGetRolesForUserQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? getCookie('AltinnPartyUuid') ?? '',
    },
    {
      skip: !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );
  console.log('roleConnections: ', roleConnections);

  const isSm = useIsMobileOrSmaller();

  if (partyIsLoading || roleConnectionsIsLoading || isLoading) {
    return <SkeletonRoleList />;
  }
  return <div className={classes.roleLists}>role connections</div>;
};
