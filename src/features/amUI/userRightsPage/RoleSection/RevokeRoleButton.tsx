import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useRevokeDelegationMutation } from '@/rtk/features/accessPackageApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

interface RevokeRoleButtonProps extends ButtonProps {
  roleId: string;
  roleName: string;
  toParty?: Party;
  fullText?: boolean;
}

export const RevokeRoleButton = ({
  roleId,
  roleName,
  toParty,
  fullText = false,
  disabled,
  ...props
}: RevokeRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [revoke, { isLoading }] = useRevokeDelegationMutation();

  const onClick = () => {
    const snackbar = (isSuccessful: boolean) => {
      const snackbarData = {
        message: t(
          isSuccessful
            ? 'access_packages.package_deletion_success'
            : 'access_packages.package_deletion_error',
          { role: roleName, name: toParty?.name },
        ),
        variant: SnackbarMessageVariant.Default,
        duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
      };
      openSnackbar(snackbarData);
    };

    if (representingParty) {
      revoke({
        to: toParty?.partyUuid || '',
        packageId: roleId,
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
      variant={'outline'}
      onClick={onClick}
      disabled={disabled || isLoading || !representingParty}
    >
      {fullText ? t('common.delete_poa') : t('common.delete')}
    </Button>
  );
};
