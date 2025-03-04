import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';

export const ActiveDelegations = ({ toParty }: { toParty: Party }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { error: actionError, setError: setActionError } = useActionError();
  const { data: currentUser, isLoading: currentUserLoading } = useGetUserInfoQuery();

  const isCurrentUser = currentUser?.uuid === toParty.partyUuid;

  return (
    <>
      <AccessPackageList
        isLoading={currentUserLoading}
        showAllPackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        fromPartyUuid={getCookie('AltinnPartyUuid')}
        toPartyUuid={toParty.partyUuid}
        useDeleteConfirm={isCurrentUser}
        availableActions={[
          DelegationAction.REVOKE,
          isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
        ]}
        onDelegateError={(accessPackage, error) => {
          setActionError(error);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onRevokeError={(accessPackage, error) => {
          setActionError(error);
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
          setActionError(null);
        }}
        openWithError={actionError}
      />
    </>
  );
};
