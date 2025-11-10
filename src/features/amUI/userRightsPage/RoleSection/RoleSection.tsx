import { useParams } from 'react-router';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import type { Role } from '@/rtk/features/roleApi';

import { RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/RoleInfoModal/RoleInfoModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { toParty, isLoading } = usePartyRepresentation();

  return (
    <>
      <OldRolesAlert />
      <RoleList
        availableActions={[DelegationAction.REVOKE]}
        onActionError={(role, error) => {
          setModalItem(role);
          setActionError(error);
          modalRef.current?.showModal();
        }}
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
        isLoading={isLoading}
      />
      {toParty && (
        <RoleInfoModal
          modalRef={modalRef}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
          availableActions={[DelegationAction.REVOKE]}
        />
      )}
    </>
  );
};
