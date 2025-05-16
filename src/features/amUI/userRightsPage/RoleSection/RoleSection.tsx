import { useParams } from 'react-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import type { Role } from '@/rtk/features/roleApi';

import { RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/RoleList/RoleInfoModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

interface RoleSectionProps {
  numberOfAccesses?: number;
}

export const RoleSection = ({ numberOfAccesses }: RoleSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { id: rightHolderUuid } = useParams();
  const { toParty } = usePartyRepresentation();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetUserInfoQuery();
  const isCurrentUser = currentUser?.uuid === rightHolderUuid;

  return (
    <>
      <OldRolesAlert />
      <DsHeading
        level={2}
        data-size='2xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: numberOfAccesses })}
      </DsHeading>
      <DsParagraph data-size='sm'>{t('role.roles_description')}</DsParagraph>
      <RoleList
        availableActions={[
          isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
          DelegationAction.REVOKE,
        ]}
        onActionError={(role, error) => {
          setModalItem(role);
          setActionError(error);
          modalRef.current?.showModal();
        }}
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
        isLoading={currentUserIsLoading}
      />
      {toParty && (
        <RoleInfoModal
          modalRef={modalRef}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
          availableActions={[
            isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
            DelegationAction.REVOKE,
          ]}
        />
      )}
    </>
  );
};
