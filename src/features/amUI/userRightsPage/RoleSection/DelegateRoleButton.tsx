import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useDelegateMutation } from '@/rtk/features/roleApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

interface DelegateRoleButtonProps extends ButtonProps {
  roleId: string;
  roleName: string;
  toParty: Party;
  fullText?: boolean;
}

export const DelegateRoleButton = ({
  roleId,
  roleName,
  toParty,
  fullText = false,
  disabled,
  variant = 'outline',
  ...props
}: DelegateRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [delegateRole, { isLoading }] = useDelegateMutation();

  const onClick = () => {
    const snackbar = (isSuccessful: boolean) => {
      const snackbarData = {
        message: t(isSuccessful ? 'role.role_delegation_success' : 'role.role_delegation_error', {
          role: roleName,
          name: toParty?.name,
        }),
        variant: SnackbarMessageVariant.Default,
        duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
      };
      openSnackbar(snackbarData);
    };

    if (representingParty) {
      delegateRole({
        to: toParty?.partyUuid || '',
        roleId: roleId,
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
      {...props}
      variant={variant}
      onClick={onClick}
      disabled={isLoading || disabled || !representingParty}
    >
      {fullText ? t('common.give_poa') : t('common.give_poa')}
    </Button>
  );
};
