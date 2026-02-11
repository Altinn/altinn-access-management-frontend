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
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useBackUrl } from '@/resources/hooks/useBackUrl';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: isHovedadmin, isLoading: isHovedadminLoading } = useGetIsHovedadminQuery();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const backUrl = useBackUrl(`/${amUIPath.Users}`);

  const actingPartyUuid =
    !isHovedadminLoading && !isHovedadmin && !currentUserIsLoading && currentUser?.partyUuid === id
      ? currentUser?.partyUuid
      : getCookie('AltinnPartyUuid');

  useDocumentTitle(t('user_rights_page.page_title'));

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
          returnToUrlOnError={backUrl}
        >
          <BreadcrumbsWrapper />
          <DelegationModalProvider>
            <PageContainer
              backUrl={backUrl}
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
