import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Alert, Paragraph, Spinner } from '@digdir/designsystemet-react';

import { useGetRightHolderDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';
import { List } from '@/components';

import { DelegatedAreaListItem } from './DelegatedAreaListItem';
import { DelegatedPackagesList } from './DelegatedPackagesList';

export const ActiveDelegations = () => {
  const { t } = useTranslation();
  const { id } = useParams();

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
                  onSelection={(pack) => console.log('clicked on access package: ', pack.name)}
                />
              </DelegatedAreaListItem>
            );
          })}
      </List>
    )
  );
};
