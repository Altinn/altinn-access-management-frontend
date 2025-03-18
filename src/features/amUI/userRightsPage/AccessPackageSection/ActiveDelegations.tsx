import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useActionError } from '@/resources/hooks/useActionError';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';

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
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        fromPartyUuid={getCookie('AltinnPartyUuid')}
        toPartyUuid={toParty?.partyUuid ?? ''}
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
