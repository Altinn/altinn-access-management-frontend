import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useRerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { amUIPath } from '@/routes/paths';
import { PageWrapper } from '@/components';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DeleteUserModal } from '../common/DeleteUserModal/DeleteUserModal';

import { AccessPackageSection } from './AccessPackageSection/AccessPackageSection';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';
import { RoleSection } from './RoleSection/RoleSection';
import { PartyType, useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { UserRightsPageSkeleton } from './UserRightsPageSkeleton';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { formatDisplayName } from '@altinn/altinn-components';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: isHovedadmin, isLoading: isHovedadminLoading } = useGetIsHovedadminQuery();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();

  const actingPartyUuid =
    !isHovedadminLoading && !isHovedadmin && !currentUserIsLoading && currentUser?.partyUuid === id
      ? currentUser?.partyUuid
      : getCookie('AltinnPartyUuid');

  useRerouteIfNotConfetti();

  const { displayRoles } = window.featureFlags;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          loadingComponent={<UserRightsPageSkeleton />}
          isLoading={isHovedadminLoading || currentUserIsLoading}
          actingPartyUuid={actingPartyUuid ?? ''}
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyUuid={id ?? undefined}
          returnToUrlOnError={`/${amUIPath.Users}`}
        >
          <BreadcrumbsWrapper />
          <DelegationModalProvider>
            <PageContainer
              backUrl={`/${amUIPath.Users}`}
              contentActions={<DeleteUserModal direction='to' />}
            >
              <UserPageHeader
                direction='to'
                displayRoles={displayRoles}
              />
              <RightsTabs
                packagesPanel={<AccessPackageSection />}
                singleRightsPanel={<SingleRightsSection />}
                roleAssignmentsPanel={<RoleSection />}
              />
            </PageContainer>
          </DelegationModalProvider>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const BreadcrumbsWrapper = () => {
  const { toParty } = usePartyRepresentation();
  return (
    <Breadcrumbs
      items={['root', 'users']}
      lastBreadcrumb={{
        label: formatDisplayName({
          fullName: toParty?.name ?? '',
          type: toParty?.partyTypeName === PartyType.Organization ? 'company' : 'person',
        }),
      }}
    />
  );
};
