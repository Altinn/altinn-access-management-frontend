import { DsChip } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { Role, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { useRef, useState } from 'react';
import { RoleInfoModal } from '../DelegationModal/RoleInfoModal';
import { useGroupedRoleListEntries } from '../RoleList/useGroupedRoleListEntries';
import { useRoleMetadata } from './useRoleMetadata';
import { ClientAccessInfoModal } from './ClientAccessInfoModal';
import { GuardianshipInfoModal } from './GuardianshipInfoModal';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isClientAccessModalOpen, setIsClientAccessModalOpen] = useState(false);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);

  const { toParty, fromParty, actingParty, selfParty } = usePartyRepresentation();

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

  const { userRoles, altinn3Roles, guardianshipRoles } = useGroupedRoleListEntries({
    permissions,
  });

  const {
    mapRoles,
    isLoading: loadingRoleMetadata,
    isError: roleMetadataError,
  } = useRoleMetadata();

  const onChipClick = (role: Role) => {
    setSelectedRole(role);
    if (!modalRef.current?.open) {
      modalRef.current?.showModal();
    }
  };

  const onModalClose = () => {
    setSelectedRole(null);
  };

  const roles = mapRoles(userRoles?.map(({ role }) => role) ?? []);
  const isAgent = altinn3Roles.some((rolePermission) => rolePermission.role.code === 'agent');
  const isViewingOwnAccess = toParty?.partyUuid === selfParty?.partyUuid;
  const isGuardian = guardianshipRoles.length > 0;

  return (
    <>
      <div
        className={cn(classes.userRoles, className)}
        {...props}
      >
        {isAgent && (
          <DsChip.Button onClick={() => setIsClientAccessModalOpen(true)}>
            {t('user_roles.has_client_access')}
          </DsChip.Button>
        )}
        {isGuardian && (
          <DsChip.Button onClick={() => setIsGuardianModalOpen(true)}>
            {t('user_roles.is_guardian')}
          </DsChip.Button>
        )}
        {roles.map((role) => {
          return (
            <DsChip.Button
              key={role.id}
              onClick={() => onChipClick(role)}
            >
              {role.name}
            </DsChip.Button>
          );
        })}
      </div>
      <RoleInfoModal
        modalRef={modalRef}
        role={selectedRole || undefined}
        onClose={onModalClose}
      />
      {isAgent && (
        <ClientAccessInfoModal
          open={isClientAccessModalOpen}
          onClose={() => setIsClientAccessModalOpen(false)}
          isViewingOwnAccess={isViewingOwnAccess}
        />
      )}
      {isGuardian && (
        <GuardianshipInfoModal
          open={isGuardianModalOpen}
          onClose={() => setIsGuardianModalOpen(false)}
        />
      )}
    </>
  );
};
