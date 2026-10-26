import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { type DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../../common/RestoreFocus';

interface ActiveDelegationsProps {
  searchString?: string;
  availableActions: DelegationAction[];
}

export const ActiveDelegations = ({ searchString, availableActions }: ActiveDelegationsProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { isLoading } = usePartyRepresentation();
  const { t } = useTranslation();
  const restoreFocus = useRestoreFocus();

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <AccessPackageList
          isLoading={isLoading}
          showPackagesCount
          showAllPackages
          showAllAreas={!!searchString}
          showUnassignedAvailableAreas={!!searchString}
          minimizeAvailablePackages={!searchString}
          searchString={searchString}
          onSelect={(accessPackage) => {
            setModalItem(accessPackage);
            modalRef.current?.showModal();
          }}
          availableActions={availableActions}
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
      </RestoreFocusFallback>
      <EditModal
        ref={modalRef}
        accessPackage={modalItem}
        onClose={() => {
          if (modalItem) {
            restoreFocus.requestFocus(modalItem.id);
          }
          setModalItem(undefined);
        }}
        availableActions={availableActions}
      />
    </RestoreFocusProvider>
  );
};
