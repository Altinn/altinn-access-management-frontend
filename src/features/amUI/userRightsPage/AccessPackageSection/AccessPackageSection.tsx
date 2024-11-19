import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { DelegationModal, DelegationType } from '../DelegationModal/DelegationModal';

import classes from './AccessPackageSection.module.css';

export const AccessPackageSection = () => {
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
          {t('user_rights_page.access_packages_title')}
        </Heading>
        <DelegationModal
          toParty={party}
          delegationType={DelegationType.AccessPackage}
        />
      </div>
    )
  );
};
