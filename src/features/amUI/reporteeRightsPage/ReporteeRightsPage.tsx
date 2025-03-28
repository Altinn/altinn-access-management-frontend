import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { useGetReporteeQuery, useGetUserAccessesQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { filterDigdirRole } from '@/resources/utils/roleUtils';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { UserRoles } from '../common/UserRoles/UserRoles';
import { SnackbarProvider } from '../common/Snackbar/SnackbarProvider';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';

import { ReporteeAccessPackageSection } from './ReporteeAccessPackageSection';
import { ReporteeRoleSection } from './ReporteeRoleSection';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export const ReporteeRightsPage = () => {
  const { t } = useTranslation();
  const { id: reporteeUuid } = useParams();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(reporteeUuid ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const name = reporteeUuid ? party?.name : '';

  const { data: allAccesses } = useGetUserAccessesQuery({
    from: reporteeUuid ?? '',
    to: getCookie('AltinnPartyUuid'),
  });

  rerouteIfNotConfetti();

  return (
    <SnackbarProvider>
      <PartyRepresentationProvider
        fromPartyUuid={reporteeUuid ?? ''}
        toPartyUuid={getCookie('AltinnPartyUuid')}
      >
        <DelegationModalProvider>
          <PageWrapper>
            <PageLayoutWrapper>
              <PageContainer backUrl={`/${amUIPath.Reportees}`}>
                <UserPageHeader
                  userName={name}
                  userType={party?.partyTypeName}
                  subHeading={t('reportee_rights_page.heading_subtitle', { name: reportee?.name })}
                  roles={
                    !!reportee?.partyUuid &&
                    !!party?.partyUuid && (
                      <UserRoles
                        rightOwnerUuid={reportee.partyUuid}
                        rightHolderUuid={party.partyUuid}
                      />
                    )
                  }
                />
                <RightsTabs
                  tabBadge={{
                    accessPackages: allAccesses?.accessPackages?.length ?? 0,
                    services: allAccesses?.services?.length ?? 0,
                    roles: filterDigdirRole(allAccesses?.roles).length ?? 0,
                  }}
                  packagesPanel={
                    <ReporteeAccessPackageSection
                      numberOfAccesses={allAccesses?.accessPackages?.length}
                    />
                  }
                  singleRightsPanel={<div>SingleRightsSection</div>}
                  roleAssignmentsPanel={
                    <ReporteeRoleSection numberOfAccesses={allAccesses?.roles?.length} />
                  }
                />
              </PageContainer>
            </PageLayoutWrapper>
          </PageWrapper>
        </DelegationModalProvider>
      </PartyRepresentationProvider>
    </SnackbarProvider>
  );
};
