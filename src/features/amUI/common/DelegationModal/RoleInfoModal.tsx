import type { Role } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { DelegationAction, EditModal } from './EditModal';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  role?: Role;
  onClose?: () => void;
  availableActions?: DelegationAction[];
  openWithError?: ActionError | null;
  isLoading?: boolean;
}

export const RoleInfoModal = ({
  modalRef,
  role,
  onClose,
  availableActions,
  openWithError,
  isLoading,
}: RoleInfoModalProps) => {
  return (
    <EditModal
      ref={modalRef}
      role={role}
      availableActions={availableActions}
      openWithError={openWithError}
      onClose={onClose}
      isLoading={isLoading}
    />
  );
};
