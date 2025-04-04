import { useParams } from 'react-router';
import { useRef, useState } from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/rtk/features/roleApi';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/RoleList/RoleInfoModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';

interface RoleSectionProps {
  numberOfAccesses?: number;
}

export const RoleSection = ({ numberOfAccesses }: RoleSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { id: rightHolderUuid } = useParams();
  const { data: party } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetUserInfoQuery();
  const isCurrentUser = currentUser?.uuid === rightHolderUuid;

  return (
    <>
      <Heading
        level={2}
        data-size='2xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: numberOfAccesses })}
      </Heading>
      <Paragraph data-size='sm'>{t('role.roles_description')}</Paragraph>
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
      {party && (
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
