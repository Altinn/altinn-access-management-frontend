import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Party } from '@/rtk/features/lookup/lookupApi';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookup/lookupApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';

import { useSnackbar } from '../../common/Snackbar';
import { ButtonWithConfirmPopup } from '../../common/ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

interface DeleteResourceButton {
  resource: ServiceResource;
  toParty: Party;
  fullText?: boolean;
}

export const DeleteResourceButton = ({
  resource,
  toParty,
  fullText = false,
}: DeleteResourceButton) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetPartyByUUIDQuery(getCookie('AltinnPartyUuid'));
  const revoke = useRevokeResource();

  const snackbar = (isSuccessful: boolean) => {
    const snackbarData = {
      message: t(
        isSuccessful
          ? 'user_rights_page.delete_singleRight_success_message'
          : 'user_rights_page.delete_singleRight_error_message',
        { servicename: resource.title },
      ),
      variant: isSuccessful ? SnackbarMessageVariant.Success : SnackbarMessageVariant.Error,
      duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
    };
    openSnackbar(snackbarData);
  };

  return (
    representingParty && (
      <ButtonWithConfirmPopup
        message={t('user_rights_page.delete_ingleRight_confirm_message')}
        triggerButtonProps={{
          disabled: false,
          variant: 'secondary',
          color: 'danger',
          size: 'sm',
        }}
        triggerButtonContent={<>{fullText ? 'Slett fullmakt' : t('common.delete')}</>}
        confirmButtonProps={{
          variant: 'primary',
          color: 'danger',
        }}
        confirmButtonContent={t('common.delete')}
        cancelButtonProps={{ variant: 'tertiary' }}
        cancelButtonContent={t('common.cancel')}
        onConfirm={() =>
          revoke(
            resource.identifier,
            representingParty,
            toParty,
            () => snackbar(true),
            () => snackbar(false),
          )
        }
      />
    )
  );
};
