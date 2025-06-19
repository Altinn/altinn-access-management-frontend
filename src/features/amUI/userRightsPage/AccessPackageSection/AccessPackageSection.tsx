import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';

import { useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

import { ActiveDelegations } from './ActiveDelegations';
import { AccessPackageInfoAlert } from './AccessPackageInfoAlert';

export const AccessPackageSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selfParty, toParty, fromParty, actingParty } = usePartyRepresentation();
  const isCurrentUser = selfParty?.partyUuid === id;

  const { data: accesses } = useGetUserDelegationsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    { skip: !toParty?.partyUuid || !fromParty?.partyUuid || !actingParty?.partyUuid },
  );

  const numberOfAccesses = accesses ? Object.values(accesses).flat().length : 0;

  return (
    toParty && (
      <>
        <AccessPackageInfoAlert />
        <DsHeading
          level={2}
          data-size='2xs'
          id='access_packages_title'
        >
          {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
        </DsHeading>
        <DelegationModal
          delegationType={DelegationType.AccessPackage}
          availableActions={[
            DelegationAction.REVOKE,
            isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
          ]}
        />
        <ActiveDelegations />
      </>
    )
  );
};
