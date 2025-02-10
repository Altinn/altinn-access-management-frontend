import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteePartyQuery } from '@/rtk/features/lookupApi';
import { useRevokeDelegationMutation, type AccessPackage } from '@/rtk/features/accessPackageApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration, SnackbarMessageVariant } from '../../common/Snackbar/SnackbarProvider';

interface DeletePackageButtonProps {
  accessPackage: AccessPackage;
  toParty: Party;
  fullText?: boolean;
  disabled?: boolean;
}

export const DeletePackageButton = ({
  accessPackage,
  toParty,
  fullText = false,
  ...props
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
            ? 'access_packages.package_deletion_success'
            : 'access_packages.package_deletion_error',
          { accessPackage: accessPackage.name, name: toParty.name },
        ),
        variant: SnackbarMessageVariant.Default,
        duration: isSuccessful ? SnackbarDuration.normal : SnackbarDuration.infinite,
      };
      openSnackbar(snackbarData);
    };

    if (representingParty) {
      revoke({
        to: toParty.partyUuid,
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
        {...props}
        variant={'outline'}
        size='md'
        onClick={onClick}
      >
        {fullText ? t('common.delete_poa') : t('common.delete')}
      </Button>
    )
  );
};
