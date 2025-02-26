import { useParams } from 'react-router-dom';
import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import { useGetReporteeQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { RoleActions, RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/RoleList/RoleInfoModal';

import classes from './roleSection.module.css';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  const { data: reportee } = useGetReporteeQuery();
  const { id: rightHolderUuid } = useParams();
  const { data: party } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetUserInfoQuery();
  const isCurrentUser = currentUser?.uuid === rightHolderUuid;

  return (
    <div className={classes.roleSection}>
      <RoleList
        from={reportee?.partyUuid ?? ''}
        to={rightHolderUuid ?? ''}
        availableActions={[
          isCurrentUser ? RoleActions.REQUEST : RoleActions.DELEGATE,
          RoleActions.REVOKE,
        ]}
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
        isLoading={currentUserIsLoading}
      />
      {party && (
        <RoleInfoModal
          modalRef={modalRef}
          toParty={party}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </div>
  );
};
