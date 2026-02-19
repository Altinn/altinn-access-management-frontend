import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsAlert, DsHeading, DsPopover } from '@altinn/altinn-components';

import { useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { PartyType, useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { TabContentSkeleton } from '../../common/RightsTabs/TabContentSkeleton';

import { ActiveDelegations } from './ActiveDelegations';
import { AccessPackageInfoAlert } from './AccessPackageInfoAlert';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';

import classes from './AccessPackageSection.module.css';
import { isGuardianshipUrn } from '@/resources/utils';
import { displayPrivDelegation } from '@/resources/utils/featureFlagUtils';
import { DebouncedSearchField } from '../../common/DebouncedSearchField/DebouncedSearchField';

export const AccessPackageSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const {
    selfParty,
    toParty,
    fromParty,
    actingParty,
    isLoading: loadingPartyRepresentation,
  } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  const isCurrentUser = selfParty?.partyUuid === id;
  const canGiveAccess = !isCurrentUser || (isCurrentUser && isHovedadmin);
  const shouldDisplayPrivDelegation = displayPrivDelegation();

  const { data: accesses, isLoading: loadingAccesses } = useGetUserDelegationsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    { skip: !toParty?.partyUuid || !fromParty?.partyUuid || !actingParty?.partyUuid },
  );

  const numberOfAccesses = accesses
    ? Object.values(accesses)
        .flat()
        .filter((item) => !isGuardianshipUrn(item.package.urn)).length
    : 0;

  // Local search state with debounce to avoid excessive backend calls
  const [debouncedSearchString, setDebouncedSearchString] = useState<string>('');

  return (
    <>
      <AccessPackageInfoAlert />
      {toParty?.partyTypeName === PartyType.Person && !shouldDisplayPrivDelegation && (
        <DsAlert data-color='warning'>{t('access_packages.person_info_alert')}</DsAlert>
      )}
      {loadingPartyRepresentation || loadingAccesses ? (
        <TabContentSkeleton />
      ) : (
        <>
          <div className={classes.headerSection}>
            <DsHeading
              level={2}
              data-size='2xs'
              id='access_packages_title'
            >
              {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
            </DsHeading>
            <DsPopover.TriggerContext>
              <DsPopover.Trigger
                icon
                variant='tertiary'
                aria-label={t('access_packages.helptext_button')}
              >
                <QuestionmarkCircleIcon />
              </DsPopover.Trigger>
              <DsPopover>{t('access_packages.helptext_content')}</DsPopover>
            </DsPopover.TriggerContext>
          </div>
          <div className={classes.inputs}>
            {numberOfAccesses > 0 && (
              <div className={classes.searchField}>
                <DebouncedSearchField
                  placeholder={t('access_packages.search_label')}
                  setDebouncedSearchString={setDebouncedSearchString}
                />
              </div>
            )}
            <div className={classes.delegateButton}>
              {(toParty?.partyTypeName === PartyType.Organization ||
                (shouldDisplayPrivDelegation && canGiveAccess)) && (
                <DelegationModal
                  delegationType={DelegationType.AccessPackage}
                  availableActions={[
                    DelegationAction.REVOKE,
                    canGiveAccess ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
                  ]}
                />
              )}
            </div>
          </div>
          <ActiveDelegations searchString={debouncedSearchString} />
        </>
      )}
    </>
  );
};
