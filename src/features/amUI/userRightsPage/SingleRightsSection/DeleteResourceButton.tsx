import React from 'react';
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
  toParty: Party;
  fullText?: boolean;
}

export const DeleteResourceButton = ({ resource, fullText = false }: DeleteResourceButton) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { fromParty, toParty } = usePartyRepresentation();
  const revoke = useRevokeResource();

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
        variant='text'
        icon={MinusCircleIcon}
        className={classes.deleteButton}
        onClick={() =>
          revoke(
            resource.identifier,
            fromParty.partyUuid,

            toParty.partyUuid,
            () => snackbar(true),
            () => snackbar(false),
          )
        }
      >
        {fullText ? t('common.delete_poa') : t('common.delete')}
      </Button>
    )
  );
};
