import { useParams } from 'react-router-dom';
import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/RoleList/RoleInfoModal';

import classes from './roleSection.module.css';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  const { data: reportee } = useGetReporteeQuery();
  const { id: rightHolderUuid } = useParams();
  const { data: party } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');

  return (
    <div className={classes.roleSection}>
      <RoleList
        from={reportee?.partyUuid ?? ''}
        to={rightHolderUuid ?? ''}
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
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
