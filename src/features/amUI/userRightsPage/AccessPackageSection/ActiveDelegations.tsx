import { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';

import { useTranslation } from 'react-i18next';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';
import {
  RestoreFocusProvider,
  useRestoreFocus,
} from '../../common/RestoreFocus/RestoreFocusContext';

interface ActiveDelegationsProps {
  searchString?: string;
}

export const ActiveDelegations = ({ searchString }: ActiveDelegationsProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { toParty, selfParty, actingParty, isLoading } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  const canGiveAccess =
    actingParty?.partyUuid !== toParty?.partyUuid && // Acting party cannot grant access to itself
    (toParty?.partyUuid !== selfParty?.partyUuid || isHovedadmin); // Only hovedadmin can give access to themselves
  const { t } = useTranslation();
  // Restore focus to the package item that opened the modal when the modal closes.
  const { containerRef, requestFocus, contextValue } = useRestoreFocus();

  return (
    <RestoreFocusProvider value={contextValue}>
      <div ref={containerRef}>
        <AccessPackageList
          isLoading={isLoading}
          showPackagesCount
          showAllPackages
          minimizeAvailablePackages={!searchString}
          searchString={searchString}
          onSelect={(accessPackage) => {
            setModalItem(accessPackage);
            modalRef.current?.showModal();
          }}
          availableActions={[
            DelegationAction.REVOKE,
            canGiveAccess ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
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
          filterByType={false}
        />
      </div>
      <EditModal
        ref={modalRef}
        accessPackage={modalItem}
        onClose={() => {
          if (modalItem) {
            requestFocus(modalItem.id);
          }
          setModalItem(undefined);
        }}
        availableActions={[
          DelegationAction.REVOKE,
          canGiveAccess ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
        ]}
      />
    </RestoreFocusProvider>
  );
};
