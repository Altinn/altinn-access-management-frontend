import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DsButton, SnackbarDuration, useSnackbar } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';
import type { Party } from '@/rtk/features/lookupApi';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './DeleteResourceButton.module.css';
import { MinusCircleIcon } from '@navikt/aksel-icons';

interface DeleteResourceButton {
  resource: ServiceResource;
  fullText?: boolean;
}

export const DeleteResourceButton = ({ resource, fullText = false }: DeleteResourceButton) => {
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
        variant='tertiary'
        icon={MinusCircleIcon}
        className={classes.deleteButton}
        disabled={isLoading}
        onClick={() => {
          setIsLoading(true);
          revoke(
            resource.identifier,
            fromParty.partyUuid,

            toParty.partyUuid,
            () => {
              setIsLoading(false);
              snackbar(true);
            },
            () => {
              setIsLoading(false);
              snackbar(false);
            },
          );
        }}
      >
        {fullText ? t('common.delete_poa') : t('common.delete')}
      </Button>
    )
  );
};
