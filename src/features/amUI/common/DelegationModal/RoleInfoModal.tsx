import type { Role } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { EditModal } from './EditModal';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  role?: Role;
  onClose?: () => void;
  openWithError?: ActionError | null;
}

export const RoleInfoModal = ({ modalRef, role, onClose, openWithError }: RoleInfoModalProps) => {
  return (
    <EditModal
      ref={modalRef}
      role={role}
      openWithError={openWithError}
      onClose={onClose}
    />
  );
};
