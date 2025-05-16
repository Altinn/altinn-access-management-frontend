import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { ReporteeAccessPackageSection } from './ReporteeAccessPackageSection';
import { ReporteeRoleSection } from './ReporteeRoleSection';

export const ReporteeRightsPage = () => {
  const { t } = useTranslation();
  const { id: reporteeUuid } = useParams();

  useDocumentTitle(t('user_rights_page.page_title'));

  rerouteIfNotConfetti();

  const { displayLimitedPreviewLaunch } = window.featureFlags;
  return (
    <PartyRepresentationProvider
      fromPartyUuid={reporteeUuid ?? ''}
      toPartyUuid={getCookie('AltinnPartyUuid')}
      actingPartyUuid={getCookie('AltinnPartyUuid')}
    >
      <DelegationModalProvider>
        <PageWrapper>
          <PageLayoutWrapper>
            <PageContainer backUrl={`/${amUIPath.Reportees}`}>
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
          </PageLayoutWrapper>
        </PageWrapper>
      </DelegationModalProvider>
    </PartyRepresentationProvider>
  );
};
