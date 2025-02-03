import { AccessPackageListItem } from '@altinn/altinn-components';

import type { ExtendedRole } from '@/rtk/features/roleApi';
import { useDelegationCheckQuery } from '@/rtk/features/roleApi';
import type { Party } from '@/rtk/features/lookupApi';

import { RevokeRoleButton } from './RevokeRoleButton';
import { DelegateRoleButton } from './DelegateRoleButton';

interface RoleLIstItemProps {
  reporteeUuid: string;
  role: ExtendedRole;
  onClick: () => void;
  assignmentId?: string;
  toParty: Party;
}

export const RoleListItem = ({
  reporteeUuid,
  role,
  onClick,
  toParty,
  assignmentId,
}: RoleLIstItemProps) => {
  const { data: delegationCheckResult, isFetching } = useDelegationCheckQuery({
    rightownerUuid: reporteeUuid,
    roleUuid: role.id,
  });

  return (
    <li>
      <AccessPackageListItem
        id={role.id}
        onClick={onClick}
        as='button'
        title={role.name}
        size='sm'
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
              disabled={isFetching || !delegationCheckResult?.canDelegate}
            />
          )
        }
      />
    </li>
  );
};
