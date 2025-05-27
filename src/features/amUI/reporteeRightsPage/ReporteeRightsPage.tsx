import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AlertIfNotAvailableForUserType } from '../common/notAvailableAlert/NotAvailableAlert';

import { ReporteeAccessPackageSection } from './ReporteeAccessPackageSection';
import { ReporteeRoleSection } from './ReporteeRoleSection';

import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { amUIPath } from '@/routes/paths';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

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
      <AlertIfNotAvailableForUserType>
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
      </AlertIfNotAvailableForUserType>
    </PartyRepresentationProvider>
  );
};
