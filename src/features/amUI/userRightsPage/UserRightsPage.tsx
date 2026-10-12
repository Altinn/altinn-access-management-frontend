import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { useGetIsAdminQuery, useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { amUIPath, GeneralPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useBackUrl } from '@/resources/hooks/useBackUrl';

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
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { GuardianshipSection } from '../common/GuardianshipSection/GuardianshipSection';

import { AccessPackageSection } from './AccessPackageSection/AccessPackageSection';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';
import { RoleSection } from './RoleSection/RoleSection';
import { InstanceSection } from './InstanceSection/InstanceSection';
import { UserRightsPageSkeleton } from './UserRightsPageSkeleton';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: isHovedadmin, isLoading: isHovedadminLoading } = useGetIsHovedadminQuery();
  const { data: isAdmin, isLoading: isAdminLoading } = useGetIsAdminQuery();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const backUrl = useBackUrl(`/${amUIPath.Users}`);
  const returnToUrl = `/${GeneralPath.BasePath}`;

  const isViewingOtherUser = !!id && id !== currentUser?.partyUuid;
  const showNoAccessAlert = !isAdminLoading && isViewingOtherUser && isAdmin === false;

  const actingPartyUuid =
    !isHovedadminLoading && !isHovedadmin && !currentUserIsLoading && currentUser?.partyUuid === id
      ? currentUser?.partyUuid
      : getCookie('AltinnPartyUuid');

  useDocumentTitle(t('user_rights_page.page_title'));

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {showNoAccessAlert ? (
          <DsAlert data-color='warning'>
            <DsParagraph>
              {t('users_page.no_access_to_users_page')}{' '}
              {returnToUrl && (
                <Link to={'/'}>{t('error_page.reportee_change_error.go_to_am')}</Link>
              )}
            </DsParagraph>
          </DsAlert>
        ) : (
          <PartyRepresentationProvider
            loadingComponent={<UserRightsPageSkeleton />}
            isLoading={isHovedadminLoading || currentUserIsLoading}
            actingPartyUuid={actingPartyUuid ?? ''}
            fromPartyUuid={getCookie('AltinnPartyUuid')}
            toPartyUuid={id ?? undefined}
            noConnectionBackUrl={backUrl}
          >
            <BreadcrumbsWrapper />
            <DelegationModalProvider>
              <PageContainer
                backUrl={backUrl}
                contentActions={<DeleteUserModal direction='to' />}
              >
                <UserPageHeader direction='to' />
                <RightsTabs
                  packagesPanel={<AccessPackageSection />}
                  singleRightsPanel={<SingleRightsSection />}
                  roleAssignmentsPanel={<RoleSection />}
                  guardianshipsPanel={<GuardianshipSection />}
                  instancesPanel={<InstanceSection />}
                />
              </PageContainer>
            </DelegationModalProvider>
          </PartyRepresentationProvider>
        )}
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
        label: formatEntityDisplayName(toParty),
      }}
    />
  );
};
