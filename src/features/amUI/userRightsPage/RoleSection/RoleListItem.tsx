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
  hasRole?: boolean;
  toParty: Party;
}

export const RoleListItem = ({
  reporteeUuid,
  role,
  hasRole,
  onClick,
  toParty,
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
          hasRole ? (
            <RevokeRoleButton
              key={role.id}
              roleId={role.id}
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
