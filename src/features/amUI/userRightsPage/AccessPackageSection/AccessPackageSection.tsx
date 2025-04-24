import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';

import { ActiveDelegations } from './ActiveDelegations';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';

export const AccessPackageSection = ({ numberOfAccesses }: { numberOfAccesses: number }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selfParty } = usePartyRepresentation();
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');
  const isCurrentUser = selfParty?.partyUuid === id;

  return (
    party && (
      <>
        <OldRolesAlert />
        <Heading
          level={2}
          data-size='2xs'
          id='access_packages_title'
        >
          {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
        </Heading>
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
