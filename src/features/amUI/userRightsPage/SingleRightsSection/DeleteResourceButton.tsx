import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useRevokeResource } from '@/resources/hooks/useRevokeResource';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import type { Party } from '@/rtk/features/lookupApi';

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
  const { data: representingParty } = useGetReporteePartyQuery();
  const revoke = useRevokeResource();

  const snackbar = (isSuccessful: boolean) => {
    const snackbarData = {
      message: t(
        isSuccessful
          ? 'single_rights.delete_singleRight_success_message'
          : 'single_rights.delete_singleRight_error_message',
        { servicename: resource.title },
      ),
      variant: SnackbarMessageVariant.Default,
      duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
    };
    openSnackbar(snackbarData);
  };

  return (
    representingParty && (
      <ButtonWithConfirmPopup
        message={t('user_rights_page.delete_confirm_message')}
        triggerButtonProps={{
          disabled: false,
          variant: 'secondary',
          color: 'danger',
          size: 'sm',
        }}
        triggerButtonContent={<>{fullText ? t('common.delete_poa') : t('common.delete')}</>}
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
