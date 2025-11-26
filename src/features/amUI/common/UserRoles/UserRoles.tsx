import { DsChip } from '@altinn/altinn-components';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { useRef, useState } from 'react';
import { RoleInfoModal } from '../DelegationModal/RoleInfoModal';
import { useGroupedRoleListEntries } from '../RoleList/useGroupedRoleListEntries';
import { useRoleMetadata } from './useRoleMetadata';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { toParty, fromParty, actingParty } = usePartyRepresentation();

  const { data: permissions } = useGetRolePermissionsQuery(
    {
      party: actingParty?.partyUuid ?? '',
      from: fromParty?.partyUuid,
      to: toParty?.partyUuid,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !toParty?.partyUuid,
    },
  );

  const { userRoles } = useGroupedRoleListEntries({
    permissions,
  });

  const { getRoleMetadata } = useRoleMetadata();

  const roleForModal = selectedRoleId
    ? (getRoleMetadata(selectedRoleId) ??
      userRoles?.find(({ role }) => role.id === selectedRoleId)?.role)
    : undefined;

  const onChipClick = (roleId: string) => {
    setSelectedRoleId(roleId);
    if (!modalRef.current?.open) {
      modalRef.current?.showModal();
    }
  };

  const onModalClose = () => {
    setSelectedRoleId(null);
  };

  return (
    <>
      <div
        className={cn(classes.userRoles, className)}
        {...props}
      >
        {userRoles?.map(({ role }) => {
          return (
            <DsChip.Button
              key={role.id}
              onClick={() => onChipClick(role.id)}
            >
              {getRoleMetadata(role.id)?.name ?? role.name ?? role.code}
            </DsChip.Button>
          );
        })}
      </div>
      <RoleInfoModal
        modalRef={modalRef}
        role={roleForModal}
        onClose={onModalClose}
      />
    </>
  );
};
