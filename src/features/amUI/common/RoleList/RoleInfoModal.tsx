import { useEffect } from 'react';

import type { DelegationAction } from '../DelegationModal/EditModal';
import { EditModal } from '../DelegationModal/EditModal';
import { DelegationModalProvider } from '../DelegationModal/DelegationModalContext';

import type { Role } from '@/rtk/features/roleApi';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toPartyUuid: string;
  fromPartyUuid: string;
  role?: Role;
  onClose?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfoModal = ({
  modalRef,
  toPartyUuid,
  fromPartyUuid,
  role,
  onClose,
  availableActions,
}: RoleInfoModalProps) => {
  useEffect(() => {
    const handleClose = () => onClose?.();

    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose, modalRef]);

  return (
    <DelegationModalProvider>
      <EditModal
        ref={modalRef}
        toPartyUuid={toPartyUuid}
        fromPartyUuid={fromPartyUuid}
        role={role}
        availableActions={availableActions}
      />
    </DelegationModalProvider>
  );
};
