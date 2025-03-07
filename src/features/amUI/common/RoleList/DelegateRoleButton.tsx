import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useDelegateMutation, useDelegationCheckQuery } from '@/rtk/features/roleApi';

import { SnackbarDuration, SnackbarMessageVariant } from '../Snackbar/SnackbarProvider';
import { useSnackbar } from '../Snackbar';

interface DelegateRoleButtonProps extends Omit<ButtonProps, 'icon'> {
  roleId: string;
  roleName: string;
  toParty?: Party;
  fullText?: boolean;
  icon?: boolean;
}

export const DelegateRoleButton = ({
  roleId,
  roleName,
  toParty,
  fullText = false,
  variant = 'text',
  icon = true,
  ...props
}: DelegateRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [delegateRole, { isLoading: delegateRoleLoading }] = useDelegateMutation();

  const { data: delegationCheckResult, isLoading: delegationCheckLoading } =
    useDelegationCheckQuery({
      rightownerUuid: representingParty?.partyUuid || '',
      roleUuid: roleId,
    });

  const canDelegate =
    delegationCheckResult?.canDelegate && !delegateRoleLoading && !delegationCheckLoading;

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
      icon={icon ? PlusCircleIcon : undefined}
      variant={variant}
      onClick={onClick}
      disabled={!canDelegate || props.disabled}
      {...props}
    >
      {fullText ? t('common.give_poa') : t('common.give_poa')}
    </Button>
  );
};
