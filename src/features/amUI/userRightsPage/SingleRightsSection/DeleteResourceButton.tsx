import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SnackbarDuration, useSnackbar } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteResourceButton.module.css';
import { MinusCircleIcon } from '@navikt/aksel-icons';

interface DeleteResourceButton {
  resource: ServiceResource;
  fullText?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

export const DeleteResourceButton = ({
  resource,
  fullText = false,
  onSuccess,
  onError,
}: DeleteResourceButton) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { fromParty, toParty } = usePartyRepresentation();
  const revoke = useRevokeResource();
  const [isLoading, setIsLoading] = useState(false);

  const snackbar = (isSuccessful: boolean) => {
    const color: 'success' | 'danger' = isSuccessful ? 'success' : 'danger';
    const snackbarData = {
      message:
        t(
          isSuccessful
            ? 'single_rights.delete_singleRight_success_message'
            : 'single_rights.delete_singleRight_error_message',
        ) + resource.title,
      color,
      duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
    };
    openSnackbar(snackbarData);
  };

  return (
    fromParty &&
    toParty && (
      <Button
        aria-label={t('common.delete') + ' ' + resource.title}
        variant='tertiary'
        className={classes.deleteButton}
        disabled={isLoading}
        onClick={() => {
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
        }}
      >
        <MinusCircleIcon />
        {fullText && t('common.delete_poa')}
      </Button>
    )
  );
};
