import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';

export const ActiveDelegations = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { toParty, selfParty, isLoading } = usePartyRepresentation();
  const isCurrentUser = selfParty?.partyUuid === toParty?.partyUuid;

  return (
    <>
      <AccessPackageList
        isLoading={isLoading}
        showAllPackages
        minimizeAvailablePackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
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
        modalItem={modalItem}
      />
    </>
  );
};
