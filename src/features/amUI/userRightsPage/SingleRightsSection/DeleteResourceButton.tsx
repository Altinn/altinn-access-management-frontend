import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, formatDisplayName, useSnackbar } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useCanRedelegateResource, useRevokeConfirmation } from '../../common/RevokeConfirmation';

import classes from './DeleteResourceButton.module.css';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { PartyType } from '@/rtk/features/userInfoApi';

interface DeleteResourceButton {
  resource: ServiceResource;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

export const DeleteResourceButton = ({
  resource,
  disabled = false,
  onSuccess,
  onError,
}: DeleteResourceButton) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { fromParty, toParty } = usePartyRepresentation();
  const revoke = useRevokeResource();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { canRedelegateResource } = useCanRedelegateResource();
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();

  const snackbar = (isSuccessful: boolean) => {
    const color: 'success' | 'danger' = isSuccessful ? 'success' : 'danger';
    const snackbarData = {
      message: t(
        isSuccessful
          ? 'single_rights.delete_singleRight_success_message'
          : 'single_rights.delete_singleRight_error_message',
        {
          resourceTitle: resource.title,
          name: formatDisplayName({
            fullName: toParty?.name || '',
            type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
          }),
        },
      ),
      color,
    };
    openSnackbar(snackbarData);
  };

  const deleteResource = () => {
    setIsLoading(true);
    revoke(
      resource.identifier,
      () => {
        setIsLoading(false);
        snackbar(true);
        onSuccess?.();
      },
      () => {
        setIsLoading(false);
        snackbar(false);
        onError?.();
      },
    );
  };

  const confirmAndDelete = async () => {
    setIsConfirming(true);
    confirmRevoke(await canRedelegateResource(resource.identifier), deleteResource);
    setIsConfirming(false);
  };

  return (
    fromParty &&
    toParty && (
      <>
        <Button
          aria-label={t('common.delete') + ' ' + resource.title}
          variant='tertiary'
          className={classes.deleteButton}
          disabled={disabled || isLoading || isConfirming}
          onClick={confirmAndDelete}
        >
          <MinusCircleIcon aria-hidden='true' />
          {t('common.delete_poa')}
        </Button>
        {revokeConfirmationDialog}
      </>
    )
  );
};
