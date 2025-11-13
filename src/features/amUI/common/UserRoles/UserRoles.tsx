import { DsChip } from '@altinn/altinn-components';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useGetRoleByIdQuery } from '@/rtk/features/roleApi';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoleCodesAndIdsForKeyRoles } from './roleUtils';
import { RoleInfoModal } from '../DelegationModal/RoleInfoModal';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

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
  const isModalLoading = !!selectedRoleId && selectedRole?.id !== selectedRoleId;
  const roleForModal = isModalLoading ? undefined : selectedRole;

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
        role={roleForModal}
        isLoading={isModalLoading}
        onClose={onModalClose}
      />
    </>
  );
};
