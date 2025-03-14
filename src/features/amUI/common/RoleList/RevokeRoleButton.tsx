import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import { useSnackbar } from '../Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../Snackbar/SnackbarProvider';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useRevokeMutation } from '@/rtk/features/roleApi';

interface RevokeRoleButtonProps extends Omit<ButtonProps, 'icon'> {
  assignmentId: string;
  roleName: string;
  toParty?: Party;
  fullText?: boolean;
  icon?: boolean;
}

export const RevokeRoleButton = ({
  assignmentId,
  roleName,
  toParty,
  fullText = false,
  disabled,
  variant = 'text',
  icon = true,
  ...props
}: RevokeRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [revoke, { isLoading }] = useRevokeMutation();

  const onClick = () => {
    const snackbar = (isSuccessful: boolean) => {
      const snackbarData = {
        message: t(isSuccessful ? 'role.role_deletion_success' : 'role.role_deletion_error', {
          role: roleName,
          name: toParty?.name,
        }),
        variant: SnackbarMessageVariant.Default,
        duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
      };
      openSnackbar(snackbarData);
    };

    if (representingParty) {
      revoke({
        assignmentId: assignmentId,
      })
        .unwrap()
        .then(() => {
          snackbar(true);
        })
        .catch((error) => {
          console.log(error);
          snackbar(false);
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
