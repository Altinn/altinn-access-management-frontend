import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';

import { ActiveDelegations } from './ActiveDelegations';

export const AccessPackageSection = ({ numberOfAccesses }: { numberOfAccesses: number }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selfParty, toParty } = usePartyRepresentation();
  const isCurrentUser = selfParty?.partyUuid === id;

  return (
    toParty && (
      <>
        <OldRolesAlert />
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
