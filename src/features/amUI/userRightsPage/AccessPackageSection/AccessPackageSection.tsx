import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Avatar, ListItem } from '@altinn/altinn-components';

import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { useGetRightHolderDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';

import { DelegationModal, DelegationType } from '../DelegationModal/DelegationModal';

import classes from './AccessPackageSection.module.css';

export const AccessPackageSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: party } = useGetPartyByUUIDQuery(id ?? '');
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

  const display = allPackageAreas
    ?.filter((area) => areasToShow.some((areaId) => areaId === area.id))
    .map((area) => {
      return (
        <ListItem
          key={area.id}
          id={area.id}
          avatar={{ name: area.name, imageUrl: area.iconUrl }}
        >
          {area.name}
        </ListItem>
      );
    });

  return (
    party && (
      <div className={classes.singleRightsSectionContainer}>
        <Heading
          level={2}
          size='xs'
          id='access_packages_title'
        >
          {t('user_rights_page.access_packages_title')}
        </Heading>
        <DelegationModal
          toParty={party}
          delegationType={DelegationType.AccessPackage}
        />
        {display}
      </div>
    )
  );
};
