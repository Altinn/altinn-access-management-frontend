import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import type { Role } from '@/rtk/features/roleApi';
import { useRevokeMutation } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { useSnackbar } from '../Snackbar';

interface RevokeRoleButtonProps extends Omit<ButtonProps, 'icon'> {
  accessRole: Role;
  assignmentId: string;
  toParty?: Party;
  fullText?: boolean;
  icon?: boolean;
  onRevokeSuccess?: (role: Role, toParty: Party) => void;
  onRevokeError?: (role: Role, errorInfo: ActionError) => void;
}

export const RevokeRoleButton = ({
  assignmentId,
  accessRole,
  toParty,
  fullText = false,
  disabled,
  variant = 'text',
  icon = true,
  onRevokeSuccess,
  onRevokeError,
  ...props
}: RevokeRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [revoke, { isLoading }] = useRevokeMutation();

  const handleRevokeSuccess = (role: Role, toParty?: Party) => {
    if (onRevokeSuccess && toParty) onRevokeSuccess(role, toParty);
    else {
      openSnackbar({
        message: t('access_packages.package_deletion_success', {
          name: toParty?.name ?? '',
          accessPackage: role.name,
        }),
      });
    }
  };

  const handleRevokeError = (
    role: Role,
    toParty?: Party,
    httpStatus?: string,
    timestamp?: string,
  ) => {
    if (onRevokeError)
      onRevokeError(role, { httpStatus: httpStatus ?? '', timestamp: timestamp ?? '' });
    else {
      openSnackbar({
        message: t('access_packages.package_deletion_error', {
          name: toParty?.name,
          accessPackage: role.name,
        }),
      });
    }
  };

  const onClick = () => {
    if (representingParty) {
      revoke({
        assignmentId: assignmentId,
      })
        .unwrap()
        .then(() => {
          handleRevokeSuccess(accessRole, toParty);
        })
        .catch((error) => {
          handleRevokeError(accessRole, toParty, error.status, error.timestamp);
        });
    }
  };

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || isLoading || !representingParty}
      icon={icon ? MinusCircleIcon : undefined}
      {...props}
    >
      {fullText ? t('common.delete_poa') : t('common.delete_poa')}
    </Button>
  );
};
