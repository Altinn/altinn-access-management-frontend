import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { DelegationModal, DelegationType } from '../DelegationModal/DelegationModal';

import classes from './AccessPackageSection.module.css';
import { ActiveDelegations } from './ActiveDelegations';

export const AccessPackageSection = ({ numberOfAccesses }: { numberOfAccesses: number }) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

  return (
    party && (
      <div className={classes.singleRightsSectionContainer}>
        <Heading
          level={2}
          size='xs'
          id='access_packages_title'
        >
          {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
        </Heading>
        <DelegationModal
          toParty={party}
          delegationType={DelegationType.AccessPackage}
        />
        <ActiveDelegations />
      </div>
    )
  );
};
