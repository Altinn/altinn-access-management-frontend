import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import { getDeletionStatus, getNonDeletableReasons } from './deletionModalUtils';
import { DeleteUserModalContent } from './DeleteUserModalContent';

export type DeleteUserDirection = 'to' | 'from';

export interface DeleteUserModalProps {
  direction?: DeleteUserDirection;
}

export const DeleteUserModal = ({ direction = 'to' }: DeleteUserModalProps) => {
  const { fromParty, toParty, actingParty, selfParty } = usePartyRepresentation();

  const targetPartyUuid = direction === 'to' ? toParty?.partyUuid : fromParty?.partyUuid;
  const viewingYourself =
    !!targetPartyUuid && !!selfParty?.partyUuid && targetPartyUuid === selfParty.partyUuid;

  const { data: rolePermissions, isLoading: isRolePermissionsLoading } = useGetRolePermissionsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    {
      skip: !fromParty?.partyUuid || !toParty?.partyUuid || !actingParty?.partyUuid,
    },
  );

  const status = getDeletionStatus(rolePermissions, viewingYourself, direction === 'from');
  const nonDeletableReasons = getNonDeletableReasons(rolePermissions);

  return (
    <DeleteUserModalContent
      status={status}
      nonDeletableReasons={nonDeletableReasons}
      isRolePermissionsLoading={isRolePermissionsLoading}
    />
  );
};
