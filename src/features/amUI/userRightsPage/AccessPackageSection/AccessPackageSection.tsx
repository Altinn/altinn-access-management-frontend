import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';

import { isGuardianshipUrn } from '@/resources/utils';
import { useCanGiveAccess } from '@/resources/hooks/useCanGiveAccess';
import { useCanRequestAccess } from '@/resources/hooks/useCanRequestAccess';
import { useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';

import { AccessPackageDelegationModal } from '../../common/DelegationModal/AccessPackages/AccessPackageDelegationModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { getAvailableActions } from '../../common/DelegationModal/delegationActionUtils';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { TabContentSkeleton } from '../../common/RightsTabs/TabContentSkeleton';
import { PackageSearchToolbar } from '../../common/PackageSearchToolbar/PackageSearchToolbar';
import { AccessPackageInfoPopover } from '../../common/AccessPackageInfoPopover/AccessPackageInfoPopover';

import { ActiveDelegations } from './ActiveDelegations';
import { PendingPackageRequests } from './PendingPackageRequests/Requests';
import classes from './AccessPackageSection.module.css';

export const AccessPackageSection = ({ isReportee = false }: { isReportee?: boolean }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const {
    toParty,
    fromParty,
    actingParty,
    isLoading: loadingPartyRepresentation,
  } = usePartyRepresentation();
  const partyId = isReportee ? (toParty?.id ?? '') : (id ?? '');
  const canGiveAccess = useCanGiveAccess(partyId, isReportee);
  const canRequestAccess = useCanRequestAccess(isReportee) && !canGiveAccess;

  const availableActions = getAvailableActions({ canGiveAccess, canRequestAccess });

  const { data: accesses, isLoading: loadingAccesses } = useGetUserDelegationsQuery(
    {
      from: fromParty?.id ?? '',
      to: toParty?.id ?? '',
      party: actingParty?.id ?? '',
    },
    { skip: !toParty?.id || !fromParty?.id || !actingParty?.id },
  );

  const numberOfAccesses = accesses
    ? Object.values(accesses)
        .flat()
        .filter((item) => !isGuardianshipUrn(item.package.urn)).length
    : 0;

  const [searchString, setSearchString] = useState('');
  const [serviceOwners, setServiceOwners] = useState<string[]>([]);

  return (
    <>
      {loadingPartyRepresentation || loadingAccesses ? (
        <TabContentSkeleton />
      ) : (
        <>
          <div className={classes.headerSection}>
            <DsHeading
              level={2}
              data-size='xs'
              id='access_packages_title'
            >
              {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
            </DsHeading>
            <AccessPackageInfoPopover />
          </div>
          {canRequestAccess && <PendingPackageRequests />}
          <div className={classes.inputs}>
            <PackageSearchToolbar
              searchString={searchString}
              setSearchString={setSearchString}
              serviceOwners={serviceOwners}
              setServiceOwners={setServiceOwners}
            />
            <div className={classes.delegateButton}>
              {(availableActions.includes(DelegationAction.DELEGATE) ||
                availableActions.includes(DelegationAction.REQUEST)) && (
                <AccessPackageDelegationModal availableActions={availableActions} />
              )}
            </div>
          </div>
          <ActiveDelegations
            searchString={searchString}
            serviceOwners={serviceOwners}
            availableActions={availableActions}
          />
        </>
      )}
    </>
  );
};
