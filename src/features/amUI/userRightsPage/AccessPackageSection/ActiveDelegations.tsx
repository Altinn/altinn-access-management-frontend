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
import { useActionError } from '@/resources/hooks/useActionError';

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
          setActionError(null);
          modalRef.current?.showModal();
        }}
        fromPartyUuid={getCookie('AltinnPartyUuid')}
        toPartyUuid={toParty.partyUuid}
        useDeleteConfirm={isCurrentUser}
        availableActions={[
          packageActions.REVOKE,
          isCurrentUser ? packageActions.REQUEST : packageActions.DELEGATE,
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
        }}
        openWithError={actionError ?? undefined}
      />
    </>
  );
};
