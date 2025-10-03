import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';
import { useTranslation } from 'react-i18next';

export const ActiveDelegations = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { toParty, selfParty, isLoading } = usePartyRepresentation();
  const isCurrentUser = selfParty?.partyUuid === toParty?.partyUuid;
  const { t } = useTranslation();

  return (
    <>
      <AccessPackageList
        isLoading={isLoading}
        showPackagesCount
        showAllPackages
        minimizeAvailablePackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
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
        noPackagesText={t('access_packages.user_has_no_packages')}
      />
      <AccessPackageInfoModal
        modalRef={modalRef}
        modalItem={modalItem}
      />
    </>
  );
};
