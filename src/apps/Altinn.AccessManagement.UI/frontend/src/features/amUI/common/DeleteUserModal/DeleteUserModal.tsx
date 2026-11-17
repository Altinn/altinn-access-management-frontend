import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import { getDeletionStatus, getNonDeletableReasons, getViaParties } from './deletionModalUtils';
import { DeleteUserModalContent } from './DeleteUserModalContent';

export type DeleteUserDirection = 'to' | 'from';

export interface DeleteUserModalProps {
  direction?: DeleteUserDirection;
}

export const DeleteUserModal = ({ direction = 'to' }: DeleteUserModalProps) => {
  const { fromParty, toParty, actingParty, selfParty } = usePartyRepresentation();

  const targetPartyUuid = direction === 'to' ? toParty?.id : fromParty?.id;
  const viewingYourself = !!targetPartyUuid && !!selfParty?.id && targetPartyUuid === selfParty.id;

  const { data: rolePermissions, isLoading: isRolePermissionsLoading } = useGetRolePermissionsQuery(
    {
      from: fromParty?.id ?? '',
      to: toParty?.id ?? '',
      party: actingParty?.id ?? '',
    },
    {
      skip: !fromParty?.id || !toParty?.id || !actingParty?.id,
    },
  );

  const status = getDeletionStatus(rolePermissions, viewingYourself, direction === 'from');
  const nonDeletableReasons = getNonDeletableReasons(rolePermissions);
  const viaParties = getViaParties(rolePermissions);

  return (
    <DeleteUserModalContent
      status={status}
      nonDeletableReasons={nonDeletableReasons}
      viaParties={viaParties}
      isRolePermissionsLoading={isRolePermissionsLoading}
    />
  );
};
