import { useEffect } from 'react';

import type { Role } from '@/rtk/features/roleApi';

import type { DelegationAction } from '../DelegationModal/EditModal';
import { EditModal } from '../DelegationModal/EditModal';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  role?: Role;
  onClose?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfoModal = ({
  modalRef,
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
    <EditModal
      ref={modalRef}
      role={role}
      availableActions={availableActions}
    />
  );
};
