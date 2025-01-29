import { useTranslation } from 'react-i18next';
import { Button } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useDelegateMutation } from '@/rtk/features/roleApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

interface DelegateRoleButtonProps extends React.ComponentProps<typeof Button> {
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
  ...props
}: DelegateRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [delegateRole, { isLoading }] = useDelegateMutation();

  const onClick = () => {
    const snackbar = (isSuccessful: boolean) => {
      const snackbarData = {
        message: t(
          isSuccessful
            ? 'access_packages.package_deletion_success'
            : 'access_packages.package_deletion_error',
          { role: roleName, name: toParty.name },
        ),
        variant: SnackbarMessageVariant.Default,
        duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
      };
      openSnackbar(snackbarData);
    };

    if (representingParty) {
      delegateRole({
        to: toParty.partyUuid,
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
      variant={'outline'}
      size='md'
      onClick={onClick}
      disabled={isLoading || disabled || !representingParty}
    >
      {fullText ? t('common.give_poa') : t('common.give_poa')}
    </Button>
  );
};
