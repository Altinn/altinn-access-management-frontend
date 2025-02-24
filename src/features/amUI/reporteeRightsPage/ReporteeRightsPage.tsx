import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { SnackbarProvider } from '../common/Snackbar/SnackbarProvider';
import { UserRoles } from '../common/UserRoles/UserRoles';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';

import { ReporteeAccessPackageSection } from './ReporteeAccessPackageSection';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { useGetReporteeQuery, useGetUserAccessesQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { filterDigdirRole } from '@/resources/utils/roleUtils';
import { RoleList } from '../common/RoleList/RoleList';

export const ReporteeRightsPage = () => {
  const { t } = useTranslation();
  const { id: reporteeUuid } = useParams();

  const navigate = useNavigate();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(reporteeUuid ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const name = reporteeUuid ? party?.name : '';

  const { data: allAccesses } = useGetUserAccessesQuery({
    from: reporteeUuid ?? '',
    to: getCookie('AltinnPartyUuid'),
  });

  return (
    <SnackbarProvider>
      <PageWrapper>
        <PageLayoutWrapper>
          <PageContainer onNavigateBack={() => navigate(`/${amUIPath.Reportees}`)}>
            <>
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
                    reporteeUuid={reporteeUuid}
                  />
                }
                singleRightsPanel={<div>SingleRightsSection</div>}
                roleAssignmentsPanel={
                  <div>
                    <RoleList
                      from={''}
                      to={''}
                    />
                  </div>
                }
              />
            </>
          </PageContainer>
        </PageLayoutWrapper>
      </PageWrapper>
    </SnackbarProvider>
  );
};
