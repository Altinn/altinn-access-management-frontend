import { DsChip } from '@altinn/altinn-components';

import cn from 'classnames';

import classes from './userRoles.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoleCodesAndIdsForKeyRoles, getRoleCodesForKeyRoles } from './roleUtils';
import { RoleInfoModal } from './RoleInfoModal';

export const UserRoles = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
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

  const onChipClick = (roleId: string) => {
    setModalOpen(true);
    setSelectedRoleId(roleId);
  };

  const onModalClose = () => {
    setModalOpen(false);
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
        open={modalOpen}
        onClose={onModalClose}
        roleId={selectedRoleId ?? undefined}
      />
    </>
  );
};
