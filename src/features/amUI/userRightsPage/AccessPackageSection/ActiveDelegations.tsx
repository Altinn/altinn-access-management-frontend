import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Alert, Paragraph, Spinner } from '@digdir/designsystemet-react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetRightHolderDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';
import { List } from '@/components';
import type { Party } from '@/rtk/features/lookupApi';

import { DelegatedAreaListItem } from './DelegatedAreaListItem';
import { DelegatedPackagesList } from './DelegatedPackagesList';
import { AccessPackageInfoModal } from './AccessPackageInfoModal';

export const ActiveDelegations = ({ toParty }: { toParty: Party }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = React.useState<AccessPackage | undefined>(undefined);

  const {
    data: activeDelegations,
    isFetching: isGetDelegationFetching,
    isError: isGetDelegationError,
  } = useGetRightHolderDelegationsQuery(id ?? '');

  const {
    data: allPackageAreas,
    isFetching: isGetPackageFetching,
    isError: isGetPackageError,
  } = useSearchQuery('');

  const isError = isGetDelegationError || isGetPackageError;
  const isFetching = isGetDelegationFetching || isGetPackageFetching;

  const areasToShow = Object.keys(activeDelegations ?? {});

  return isFetching ? (
    <Spinner title={t('common.loading')} />
  ) : isError ? (
    <Alert color='danger'>
      <Paragraph>{t(`common.general_error_paragraph`)}</Paragraph>
    </Alert>
  ) : (
    activeDelegations && (
      <>
        <List spacing>
          {allPackageAreas
            ?.filter((area) => areasToShow.some((areaId) => areaId === area.id))
            .map((area) => {
              return (
                <DelegatedAreaListItem
                  key={area.id}
                  accessPackageArea={area}
                >
                  <DelegatedPackagesList
                    packageDelegations={activeDelegations[area.id]}
                    accessPackages={area.accessPackages}
                    onSelection={(pack) => {
                      setModalItem(pack);
                      modalRef.current?.showModal();
                    }}
                  />
                </DelegatedAreaListItem>
              );
            })}
        </List>
        <AccessPackageInfoModal
          modalRef={modalRef}
          toParty={toParty}
          modalItem={modalItem}
          onClose={() => setModalItem(undefined)}
        />
      </>
    )
  );
};
