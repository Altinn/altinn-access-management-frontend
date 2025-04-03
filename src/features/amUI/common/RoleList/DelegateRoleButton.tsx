import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { Role, useDelegateMutation, useDelegationCheckQuery } from '@/rtk/features/roleApi';

import { SnackbarDuration, SnackbarMessageVariant } from '../Snackbar/SnackbarProvider';
import { useSnackbar } from '../Snackbar';
import { ActionError } from '@/resources/hooks/useActionError';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { Spinner } from '@digdir/designsystemet-react';

interface DelegateRoleButtonProps extends Omit<ButtonProps, 'icon'> {
  accessRole: Role;
  fullText?: boolean;
  icon?: boolean;
  onDelegateError?: (role: Role, error: ActionError) => void;
  onSelect?: () => void;
  showSpinner?: boolean;
  showWarning?: boolean;
}

export const DelegateRoleButton = ({
  accessRole,
  fullText = false,
  variant = 'text',
  icon = true,
  onDelegateError,
  onSelect,
  showSpinner = false,
  showWarning = false,
  ...props
}: DelegateRoleButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { fromParty, toParty } = usePartyRepresentation();
  const [delegateRole, { isLoading: delegateRoleLoading }] = useDelegateMutation();

  const {
    data: delegationCheckResult,
    isLoading: delegationCheckLoading,
    isUninitialized: delegationCheckUninitialized,
  } = useDelegationCheckQuery({
    rightownerUuid: fromParty?.partyUuid || '',
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

    if (fromParty) {
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
  if (showSpinner && (delegationCheckUninitialized || delegationCheckLoading)) {
    return (
      <Spinner
        data-size='xs'
        aria-hidden='true'
      />
    );
  }

  if (showWarning && !canDelegate && !delegationCheckUninitialized && !delegationCheckLoading) {
    return (
      <Button
        data-size='xs'
        onClick={onSelect}
        variant='text'
        aria-label={t('delegation_modal.delegation_check_not_delegable')}
        size='sm'
      >
        <ExclamationmarkTriangleIcon
          aria-hidden='true'
          fontSize={'1.2rem'}
        />
      </Button>
    );
  }
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
