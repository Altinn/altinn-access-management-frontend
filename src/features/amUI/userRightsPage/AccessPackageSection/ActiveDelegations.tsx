import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import {
  AccessPackageList,
  packageActions,
} from '../../common/AccessPackageList/AccessPackageList';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

export const ActiveDelegations = ({ toParty }: { toParty: Party }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const [actionError, setActionError] = useState<{ httpStatus: string; timestamp: string }>({
    httpStatus: '',
    timestamp: '',
  });
  const { data: currentUser, isLoading: currentUserLoading } = useGetUserInfoQuery();

  const isCurrentUser = currentUser?.uuid === toParty.partyUuid;

  return (
    <>
      <AccessPackageList
        isLoading={currentUserLoading}
        showAllPackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          setActionError({ httpStatus: '', timestamp: '' });
          modalRef.current?.showModal();
        }}
        fromPartyUuid={getCookie('AltinnPartyUuid')}
        toPartyUuid={toParty.partyUuid}
        useDeleteConfirm={isCurrentUser}
        availableActions={[
          packageActions.REVOKE,
          isCurrentUser ? packageActions.REQUEST : packageActions.DELEGATE,
        ]}
        onDelegateError={(accessPackage, toParty, status, timestamp) => {
          setActionError({ httpStatus: status, timestamp });
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onRevokeError={(accessPackage, toParty, status, timestamp) => {
          setActionError({ httpStatus: status, timestamp });
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
      />

      <AccessPackageInfoModal
        modalRef={modalRef}
        toParty={toParty}
        modalItem={modalItem}
        onClose={() => {
          setModalItem(undefined);
        }}
        openWithError={actionError}
      />
    </>
  );
};
