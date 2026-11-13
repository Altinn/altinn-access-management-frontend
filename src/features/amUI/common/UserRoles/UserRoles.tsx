import { DsChip } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { useRef, useState } from 'react';

import { type Role, useGetRolePermissionsQuery } from '@/rtk/features/roleApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { RoleInfoModal } from '../DelegationModal/RoleInfoModal';
import { useGroupedRoleListEntries } from '../RoleList/useGroupedRoleListEntries';

import classes from './userRoles.module.css';
import {
  useRoleMetadata,
  ROLE_CODES_TO_IGNORE,
  isBankruptcyEstateAdministratorRole,
} from './useRoleMetadata';
import { ClientAccessInfoModal } from './ClientAccessInfoModal';
import { GuardianshipInfoModal } from './GuardianshipInfoModal';
import { BankruptcyEstateAdministratorInfoModal } from './BankruptcyEstateAdministratorInfoModal';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isClientAccessModalOpen, setIsClientAccessModalOpen] = useState(false);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isEstateAdministratorModalOpen, setIsEstateAdministratorModalOpen] = useState(false);
  const isSmall = useIsMobileOrSmaller();

  const { toParty, fromParty, actingParty, selfParty } = usePartyRepresentation();

  const { data: permissions } = useGetRolePermissionsQuery(
    {
      party: actingParty?.id ?? '',
      from: fromParty?.id,
      to: toParty?.id,
    },
    {
      skip: !actingParty?.id || !fromParty?.id || !toParty?.id,
    },
  );

  const { userRoles, altinn3Roles, guardianshipRoles } = useGroupedRoleListEntries({
    permissions,
  });

  const { mapRoles } = useRoleMetadata();

  const onChipClick = (role: Role) => {
    setSelectedRole(role);
    if (!modalRef.current?.open) {
      modalRef.current?.showModal();
    }
  };

  const onModalClose = () => {
    setSelectedRole(null);
  };

  const roles = mapRoles(
    userRoles
      ?.filter(({ role }) => !ROLE_CODES_TO_IGNORE.includes(role.code))
      ?.map(({ role }) => role) ?? [],
  );

  const isViewingOwnAccess = toParty?.id === selfParty?.id;
  const isAgent = altinn3Roles.some((rolePermission) => rolePermission.role?.code === 'agent');
  const isGuardian = guardianshipRoles.length > 0;
  // Every person has this role from themselves to themselves, so it only counts between two parties.
  const isEstateAdministrator =
    fromParty?.id !== toParty?.id &&
    altinn3Roles.some((rolePermission) =>
      isBankruptcyEstateAdministratorRole(rolePermission.role?.code),
    );
  const chipSize = isSmall ? 'sm' : 'md';

  return (
    <>
      <div
        className={cn(classes.userRoles, className)}
        {...props}
      >
        {isAgent && (
          <DsChip.Button
            data-size={chipSize}
            onClick={() => setIsClientAccessModalOpen(true)}
          >
            {t('user_roles.has_client_access')}
          </DsChip.Button>
        )}
        {isGuardian && (
          <DsChip.Button
            data-size={chipSize}
            onClick={() => setIsGuardianModalOpen(true)}
          >
            {t('user_roles.is_guardian')}
          </DsChip.Button>
        )}
        {isEstateAdministrator && (
          <DsChip.Button
            data-size={chipSize}
            data-color='accent'
            onClick={() => setIsEstateAdministratorModalOpen(true)}
          >
            {t('user_roles.is_bankruptcy_estate_administrator')}
          </DsChip.Button>
        )}
        {roles.map((role) => {
          return (
            <DsChip.Button
              key={role.id}
              data-size={chipSize}
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
      {isEstateAdministrator && (
        <BankruptcyEstateAdministratorInfoModal
          open={isEstateAdministratorModalOpen}
          onClose={() => setIsEstateAdministratorModalOpen(false)}
          trustee={fromParty}
          isTrusteeSelectedActor={actingParty?.id === fromParty?.id}
        />
      )}
    </>
  );
};
