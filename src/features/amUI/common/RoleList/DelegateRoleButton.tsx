import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { Role, useDelegateMutation, useDelegationCheckQuery } from '@/rtk/features/roleApi';

import { SnackbarDuration, SnackbarMessageVariant } from '../Snackbar/SnackbarProvider';
import { useSnackbar } from '../Snackbar';
import { ActionError } from '@/resources/hooks/useActionError';

interface DelegateRoleButtonProps extends Omit<ButtonProps, 'icon'> {
  accessRole: Role;
  toParty?: Party;
  fullText?: boolean;
  icon?: boolean;
  onDelegateError?: (role: Role, error: ActionError) => void;
}

export const DelegateRoleButton = ({
  accessRole,
  toParty,
  fullText = false,
  variant = 'text',
  icon = true,
  onDelegateError,
  ...props
}: DelegateRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [delegateRole, { isLoading: delegateRoleLoading }] = useDelegateMutation();

  const { data: delegationCheckResult, isLoading: delegationCheckLoading } =
    useDelegationCheckQuery({
      rightownerUuid: representingParty?.partyUuid || '',
      roleUuid: accessRole.id,
    });

  const canDelegate =
    delegationCheckResult?.canDelegate && !delegateRoleLoading && !delegationCheckLoading;

  const onClick = () => {
    const snackbar = (isSuccessful: boolean) => {
      const snackbarData = {
        message: t(isSuccessful ? 'role.role_delegation_success' : 'role.role_delegation_error', {
          role: accessRole.name,
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
        roleId: accessRole.id,
      })
        .unwrap()
        .then(() => {
          snackbar(true);
        })
        .catch((error) => {
          if (onDelegateError && toParty) {
            onDelegateError(accessRole, {
              httpStatus: error.status ?? '',
              timestamp: error.timestamp ?? '',
            });
          }
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
