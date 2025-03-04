import { useEffect } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { EditModal } from '../DelegationModal/EditModal';
import { ActionError } from '@/resources/hooks/useActionError';
import { DelegationModalProvider } from '../DelegationModal/DelegationModalContext';

interface AccessPackageInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toParty: Party;
  modalItem: AccessPackage | undefined;
  onClose?: () => void;
  openWithError?: ActionError | null;
}

export const AccessPackageInfoModal = ({
  modalRef,
  toParty,
  modalItem,
  onClose,
  openWithError,
}: AccessPackageInfoModalProps) => {
  return (
    <DelegationModalProvider>
      <EditModal
        ref={modalRef}
        toParty={toParty}
        accessPackage={modalItem}
        openWithError={openWithError}
        onClose={onClose}
      />
    </DelegationModalProvider>
  );
};
