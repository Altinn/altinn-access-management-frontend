import React from 'react';
import { useTranslation } from 'react-i18next';
import { SnackbarDuration, useSnackbar } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';
import type { Party } from '@/rtk/features/lookupApi';

import { ButtonWithConfirmPopup } from '../../common/ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

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
    const color: 'success' | 'alert' = isSuccessful ? 'success' : 'alert';
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
      <ButtonWithConfirmPopup
        message={t('user_rights_page.delete_confirm_message')}
        triggerButtonProps={{
          disabled: false,
          variant: 'outline',
          color: 'accent',
          size: fullText ? 'md' : 'sm',
        }}
        triggerButtonContent={fullText ? t('common.delete_poa') : t('common.delete')}
        confirmButtonProps={{
          color: 'danger',
        }}
        confirmButtonContent={t('common.delete')}
        cancelButtonProps={{ variant: 'text' }}
        cancelButtonContent={t('common.cancel')}
        onConfirm={() =>
          revoke(
            resource.identifier,
            fromParty.partyUuid,
            toParty.partyUuid,
            () => snackbar(true),
            () => snackbar(false),
          )
        }
      />
    )
  );
};
