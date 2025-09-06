import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useRerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { amUIPath } from '@/routes/paths';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DeleteUserModal } from '../common/DeleteUserModal/DeleteUserModal';

import { ReporteeAccessPackageSection } from './ReporteeAccessPackageSection';
import { ReporteeRoleSection } from './ReporteeRoleSection';

export const ReporteeRightsPage = () => {
  const { t } = useTranslation();
  const { id: reporteeUuid } = useParams();

  useDocumentTitle(t('user_rights_page.page_title'));

  useRerouteIfNotConfetti();

  const { displayLimitedPreviewLaunch } = window.featureFlags;
  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={reporteeUuid ?? ''}
          toPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          returnToUrlOnError={`/${amUIPath.Reportees}`}
        >
          <DelegationModalProvider>
            <PageContainer
              backUrl={`/${amUIPath.Reportees}`}
              contentActions={<DeleteUserModal direction='from' />}
            >
              <UserPageHeader
                direction='from'
                displayDirection
                displayRoles={!displayLimitedPreviewLaunch}
              />
              <RightsTabs
                packagesPanel={<ReporteeAccessPackageSection />}
                singleRightsPanel={<div>SingleRightsSection</div>}
                roleAssignmentsPanel={<ReporteeRoleSection />}
              />
            </PageContainer>
          </DelegationModalProvider>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
