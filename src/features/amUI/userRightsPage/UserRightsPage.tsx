import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { NotAvailableAlert } from '../notAvailableAlert/NotAvailableAlert';

import { AccessPackageSection } from './AccessPackageSection/AccessPackageSection';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';
import { RoleSection } from './RoleSection/RoleSection';
import { DeleteUserModal } from './DeleteUserModal';

import {
  availableForUserTypeCheck,
  rerouteIfNotConfetti,
} from '@/resources/utils/featureFlagUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { amUIPath } from '@/routes/paths';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: reportee } = useGetReporteeQuery();

  useDocumentTitle(t('user_rights_page.page_title'));

  rerouteIfNotConfetti();

  const { displayLimitedPreviewLaunch } = window.featureFlags;

  return (
    <PageWrapper>
      {availableForUserTypeCheck(reportee?.type) ? (
        <PartyRepresentationProvider
          actingPartyUuid={getCookie('AltinnPartyUuid')}
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyUuid={id ?? undefined}
        >
          <DelegationModalProvider>
            <PageLayoutWrapper>
              <PageContainer
                backUrl={`/${amUIPath.Users}`}
                contentActions={<DeleteUserModal direction='to' />}
              >
                <UserPageHeader
                  direction='to'
                  displayRoles={!displayLimitedPreviewLaunch}
                />
                <RightsTabs
                  packagesPanel={<AccessPackageSection numberOfAccesses={0} />}
                  singleRightsPanel={<SingleRightsSection />}
                  roleAssignmentsPanel={<RoleSection numberOfAccesses={0} />}
                />
              </PageContainer>
            </PageLayoutWrapper>
          </DelegationModalProvider>
        </PartyRepresentationProvider>
      ) : (
        <NotAvailableAlert />
      )}
    </PageWrapper>
  );
};
