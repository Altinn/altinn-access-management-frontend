import type { Role } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { DelegationAction, EditModal } from './EditModal';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  role?: Role;
  onClose?: () => void;
  availableActions?: DelegationAction[];
  openWithError?: ActionError | null;
}

export const RoleInfoModal = ({
  modalRef,
  role,
  onClose,
  availableActions,
  openWithError,
}: RoleInfoModalProps) => {
  return (
    <EditModal
      ref={modalRef}
      role={role}
      availableActions={availableActions}
      openWithError={openWithError}
      onClose={onClose}
    />
  );
};
