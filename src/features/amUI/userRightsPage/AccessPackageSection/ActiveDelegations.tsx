import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Paragraph } from '@digdir/designsystemet-react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetRightHolderDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import type { Party } from '@/rtk/features/lookupApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration } from '../../common/Snackbar/SnackbarProvider';
import { AreaList } from '../../common/AreaList/AreaList';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';

export const ActiveDelegations = ({ toParty }: { toParty: Party }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { openSnackbar } = useSnackbar();
  const {
    data: activeDelegations,
    isLoading: isGetDelegationLoading,
    isError: isGetDelegationError,
  } = useGetRightHolderDelegationsQuery(toParty.partyUuid);

  const delegate = useDelegateAccessPackage();
  const revoke = useRevokeAccessPackage();

  const onDelegate = async (accessPackage: AccessPackage) => {
    delegate(
      toParty,
      accessPackage,
      () => {
        openSnackbar({
          message: t('access_packages.package_delegation_success', {
            name: toParty.name,
            accessPackage: accessPackage.name,
          }),
        });
      },
      () => {
        openSnackbar({
          message: t('access_packages.package_delegation_error', {
            name: toParty.name,
            accessPackage: accessPackage.name,
          }),
          duration: SnackbarDuration.infinite,
        });
      },
    );
  };

  const onRevoke = async (accessPackage: AccessPackage) => {
    revoke(
      toParty,
      accessPackage,
      () => {
        openSnackbar({
          message: t('access_packages.package_deletion_success', {
            name: toParty.name,
            accessPackage: accessPackage.name,
          }),
        });
      },
      () => {
        openSnackbar({
          message: t('access_packages.package_deletion_error', {
            name: toParty.name,
            accessPackage: accessPackage.name,
          }),
          duration: SnackbarDuration.infinite,
        });
      },
    );
  };

  const isError = isGetDelegationError;

  return (
    <>
      {isError ? (
        <Alert color='danger'>
          <Paragraph>{t('common.general_error_paragraph')}</Paragraph>
        </Alert>
      ) : (
        <AreaList
          isLoading={isGetDelegationLoading}
          activeDelegations={activeDelegations}
          showAllPackages
          onSelect={(accessPackage) => {
            setModalItem(accessPackage);
            modalRef.current?.showModal();
          }}
          onDelegate={onDelegate}
          onRevoke={onRevoke}
        />
      )}
      <AccessPackageInfoModal
        modalRef={modalRef}
        toParty={toParty}
        modalItem={modalItem}
        onClose={() => {
          setModalItem(undefined);
        }}
      />
    </>
  );
};
