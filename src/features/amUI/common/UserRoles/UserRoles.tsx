import { DsChip } from '@altinn/altinn-components';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { Role, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { useRef, useState } from 'react';
import { RoleInfoModal } from '../DelegationModal/RoleInfoModal';
import { useGroupedRoleListEntries } from '../RoleList/useGroupedRoleListEntries';
import { useRoleMetadata } from './useRoleMetadata';
import { RoleInfo } from '@/rtk/features/connectionApi';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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

  const {
    mapRoles,
    isLoading: loadingRoleMetadata,
    isError: roleMetadataError,
  } = useRoleMetadata();

  const onChipClick = (role: RoleInfo) => {
    setSelectedRole(mapToRole(role));
    if (!modalRef.current?.open) {
      modalRef.current?.showModal();
    }
  };

  const onModalClose = () => {
    setSelectedRole(null);
  };

  const roles =
    loadingRoleMetadata || roleMetadataError
      ? []
      : mapRoles(userRoles?.map(({ role }) => role) ?? ([] as RoleInfo[]));

  return (
    <>
      <div
        className={cn(classes.userRoles, className)}
        {...props}
      >
        {roles.map((role) => {
          return (
            <DsChip.Button
              key={role.id}
              onClick={() => onChipClick(role)}
            >
              {role.displayName}
            </DsChip.Button>
          );
        })}
      </div>
      <RoleInfoModal
        modalRef={modalRef}
        role={selectedRole || undefined}
        onClose={onModalClose}
      />
    </>
  );
};

const mapToRole = (role: RoleInfo): Role => ({
  id: role.id,
  code: role.code ?? '',
  name: role.displayName ?? role.code ?? '',
  description: role.description ?? '',
});
