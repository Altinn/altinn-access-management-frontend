import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@digdir/designsystemet-react';

import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useRevokeDelegationMutation, type AccessPackage } from '@/rtk/features/accessPackageApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

interface DeletePackageButtonProps {
  accessPackage: AccessPackage;
  toPartyUuid: string;
  fullText?: boolean;
}

export const DeletePackageButton = ({
  accessPackage,
  toPartyUuid,
  fullText = false,
}: DeletePackageButtonProps) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const { data: representingParty } = useGetReporteePartyQuery();
  const [revoke] = useRevokeDelegationMutation();

  const onClick = () => {
    const snackbar = (isSuccessful: boolean) => {
      const snackbarData = {
        message: t(
          isSuccessful
            ? 'access_packages.delete_success_message'
            : 'access_packages.delete_error_message',
          { packageName: accessPackage.name },
        ),
        variant: SnackbarMessageVariant.Default,
        duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
      };
      openSnackbar(snackbarData);
    };

    if (representingParty) {
      revoke({
        from: representingParty?.partyUuid,
        to: toPartyUuid,
        packageId: accessPackage.id,
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
    representingParty && (
      <Button
        disabled={false}
        variant='secondary'
        color='danger'
        size='sm'
        onClick={onClick}
      >
        {fullText ? t('common.delete_poa') : t('common.delete')}
      </Button>
    )
  );
};
