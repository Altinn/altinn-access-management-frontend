import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

import classes from './AccessPackageSection.module.css';
import { ActiveDelegations } from './ActiveDelegations';

export const AccessPackageSection = ({ numberOfAccesses }: { numberOfAccesses: number }) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: party } = useGetPartyByUUIDQuery(id ?? '');
  const partyUuid = getCookie('AltinnPartyUuid');
  const { data: currentUser } = useGetUserInfoQuery();

  const isCurrentUser = currentUser?.uuid === id;

  return (
    party && (
      <div className={classes.accessPackageSectionContainer}>
        <Heading
          level={2}
          size='xs'
          id='access_packages_title'
        >
          {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
        </Heading>
        <DelegationModal
          toPartyUuid={party.partyUuid ?? ''}
          fromPartyUuid={partyUuid}
          delegationType={DelegationType.AccessPackage}
          availableActions={[
            DelegationAction.REVOKE,
            isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
          ]}
        />
        <ActiveDelegations toParty={party} />
      </div>
    )
  );
};
