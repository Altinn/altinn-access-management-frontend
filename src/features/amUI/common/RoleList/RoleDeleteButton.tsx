import { useTranslation } from 'react-i18next';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import type { Role } from '@/rtk/features/roleApi';
import { useRemoveRoleMutation } from '@/rtk/features/roleApi';
import { useSnackbar } from '@altinn/altinn-components';
import { DeletePoaConfirmation } from '@/features/amUI/common/DeletePoaConfirmation/DeletePoaConfirmation';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

interface RoleDeleteButtonProps {
  role: Role;
  onSuccess?: () => void;
  onError?: (error: FetchBaseQueryError | SerializedError) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'danger' | 'neutral';
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: boolean;
  disabled?: boolean;
}

export const RoleDeleteButton = ({
  role,
  onSuccess,
  onError,
  size,
  color,
  variant,
  icon = false,
  disabled = false,
}: RoleDeleteButtonProps) => {
  const { t } = useTranslation();
  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();
  const [removeRole, { isLoading: isRemoveRoleLoading }] = useRemoveRoleMutation();

  const handleDeleteRole = () => {
    if (!fromParty || !toParty) return;
    removeRole({
      roleCode: role.code,
      from: fromParty.partyUuid,
      to: toParty.partyUuid,
      party: actingParty?.partyUuid ?? '',
    })
      .unwrap()
      .then(() => {
        openSnackbar({ message: t('role.delete_role_success'), color: 'success' });
        onSuccess?.();
      })
      .catch((error: FetchBaseQueryError | SerializedError) => {
        onError?.(error);
      });
  };

  return (
    <DeletePoaConfirmation
      warningText={t('role.delete_role_confirmation')}
      handleDeletion={handleDeleteRole}
      isDeleteLoading={isRemoveRoleLoading}
      loadingAriaLabel={t('role.deleting_role_loading')}
      disabled={disabled}
      size={size}
      color={color}
      variant={variant}
      icon={icon}
    />
  );
};
