import { DsChip } from '@altinn/altinn-components';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoleCodesAndIdsForKeyRoles } from './roleUtils';
import { RoleInfoModal } from '../RoleInfoModal/RoleInfoModal';
import { useGetRoleByIdQuery, type Role } from '@/rtk/features/roleApi';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [modalRole, setModalRole] = useState<Role | undefined>(undefined);

  const {
    toParty,
    fromParty,
    actingParty,
    isLoading: loadingPartyRepresentation,
  } = usePartyRepresentation();
  const { data: connectionData, isLoading: isConnectionLoading } = useGetRightHoldersQuery(
    {
      partyUuid: actingParty?.partyUuid ?? '',
      toUuid: toParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
    },
    { skip: !actingParty || (!toParty && !fromParty) },
  );
  const roleTextKeys = useMemo(() => {
    if (isConnectionLoading || loadingPartyRepresentation || !connectionData?.length) {
      return [];
    }
    return getRoleCodesAndIdsForKeyRoles(connectionData[0].roles) ?? [];
  }, [connectionData, isConnectionLoading, loadingPartyRepresentation]);

  const { data: selectedRole } = useGetRoleByIdQuery(selectedRoleId ?? '', {
    skip: !selectedRoleId,
  });

  useEffect(() => {
    if (selectedRole) {
      setModalRole(selectedRole);
      if (modalRef.current && !modalRef.current.open) {
        modalRef.current.showModal();
      }
    }
  }, [selectedRole]);

  const onChipClick = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const onModalClose = () => {
    setSelectedRoleId(null);
    setModalRole(undefined);
  };

  return (
    <>
      <div
        className={cn(classes.userRoles, className)}
        {...props}
      >
        {roleTextKeys?.map((roleTextKey) => {
          return (
            <DsChip.Button
              key={roleTextKey.id}
              onClick={() => onChipClick(roleTextKey.id)}
            >
              {t(roleTextKey.code)}
            </DsChip.Button>
          );
        })}
      </div>
      <RoleInfoModal
        modalRef={modalRef}
        role={modalRole}
        onClose={onModalClose}
      />
    </>
  );
};
