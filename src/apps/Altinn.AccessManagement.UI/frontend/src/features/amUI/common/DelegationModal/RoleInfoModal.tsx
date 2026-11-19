import { useTranslation } from 'react-i18next';

import type { Role } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { EditModal } from './EditModal';
import { RoleInfo } from './Role/RoleInfo';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  role?: Role;
  onClose?: () => void;
  openWithError?: ActionError | null;
}

export const RoleInfoModal = ({ modalRef, role, onClose, openWithError }: RoleInfoModalProps) => {
  const { t } = useTranslation();
  return (
    <EditModal
      ref={modalRef}
      ariaLabel={t('delegation_modal.aria_label.role')}
      openWithError={openWithError}
      onClose={onClose}
    >
      {role && <RoleInfo role={role} />}
    </EditModal>
  );
};
