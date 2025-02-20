import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Paragraph, Spinner } from '@digdir/designsystemet-react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetRightHolderDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';
import { List } from '@/components';
import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import type { Party } from '@/rtk/features/lookupApi';

import { useSnackbar } from '../../common/Snackbar';
import { SnackbarDuration } from '../../common/Snackbar/SnackbarProvider';

import { DelegatedAreaListItem } from './DelegatedAreaListItem';
import { DelegatedPackagesList } from './DelegatedPackagesList';
import { AccessPackageInfoModal } from './AccessPackageInfoModal';

export const ActiveDelegations = ({ toParty }: { toParty: Party }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const { openSnackbar } = useSnackbar();
  const {
    data: activeDelegations,
    isFetching: isGetDelegationFetching,
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

  const {
    data: allPackageAreas,
    isFetching: isGetPackageFetching,
    isError: isGetPackageError,
  } = useSearchQuery('');

  const isError = isGetDelegationError || isGetPackageError;
  const isFetching = isGetDelegationFetching || isGetPackageFetching;

  const areasToShow = Object.keys(activeDelegations ?? {});

  const toggleExpandedArea = (areaId: string) => {
    if (expandedAreas.some((id) => id === areaId)) {
      const newExpandedState = expandedAreas.filter((id) => id !== areaId);
      setExpandedAreas(newExpandedState);
    } else {
      const newExpandedState = [...expandedAreas, areaId];
      setExpandedAreas(newExpandedState);
    }
  };

  return (
    <>
      {isFetching ? (
        <Spinner title={t('common.loading')} />
      ) : isError ? (
        <Alert color='danger'>
          <Paragraph>{t('common.general_error_paragraph')}</Paragraph>
        </Alert>
      ) : (
        activeDelegations && (
          <List spacing>
            {allPackageAreas
              ?.filter((area) => areasToShow.some((areaId) => areaId === area.id))
              .map((area) => {
                return (
                  <DelegatedAreaListItem
                    badgeLabel={t('access_packages.delegated_packages_count_badge', {
                      total: area.accessPackages.length,
                      delegated: activeDelegations[area.id].length,
                    })}
                    key={area.id}
                    accessPackageArea={area}
                    expanded={expandedAreas.some((id) => id === area.id)}
                    toggleExpanded={() => toggleExpandedArea(area.id)}
                  >
                    <DelegatedPackagesList
                      packageDelegations={activeDelegations[area.id]}
                      accessPackages={area.accessPackages}
                      onSelection={(pack) => {
                        setModalItem(pack);
                        modalRef.current?.showModal();
                      }}
                      onDelegate={onDelegate}
                      onRevoke={onRevoke}
                    />
                  </DelegatedAreaListItem>
                );
              })}
          </List>
        )
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
