import { ListItem } from '@altinn/altinn-components';

import type { ExtendedRole } from '@/rtk/features/roleApi';
import { useDelegationCheckQuery } from '@/rtk/features/roleApi';
import type { Party } from '@/rtk/features/lookupApi';

import { RevokeRoleButton } from '../../userRightsPage/RoleSection/RevokeRoleButton';
import { DelegateRoleButton } from '../../userRightsPage/RoleSection/DelegateRoleButton';

interface RoleLIstItemProps {
  reporteeUuid: string;
  role: ExtendedRole;
  onClick: () => void;
  assignmentId?: string;
  toParty?: Party;
  active?: boolean;
}

export const RoleListItem = ({
  reporteeUuid,
  role,
  onClick,
  toParty,
  assignmentId,
  active = false,
}: RoleLIstItemProps) => {
  const { data: delegationCheckResult, isLoading } = useDelegationCheckQuery({
    rightownerUuid: reporteeUuid,
    roleUuid: role.id,
  });

  return (
    <ListItem
      id={role.id}
      onClick={onClick}
      as='button'
      title={role.name}
      size='sm'
      color={active ? 'company' : 'neutral'}
      theme='subtle'
      loading={isLoading}
      controls={
        assignmentId ? (
          <RevokeRoleButton
            key={role.id}
            assignmentId={assignmentId}
            roleName={role.name}
            toParty={toParty}
            fullText={false}
            size='sm'
            disabled={role.inherited?.length > 0}
          />
        ) : (
          <DelegateRoleButton
            key={role.id}
            roleId={role.id}
            roleName={role.name}
            toParty={toParty}
            fullText={false}
            size='sm'
            disabled={isLoading || !delegationCheckResult?.canDelegate}
          />
        )
      }
    />
  );
};
