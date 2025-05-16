import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetUserAccessesQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { filterDigdirRole } from '@/resources/utils/roleUtils';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { UserRoles } from '../common/UserRoles/UserRoles';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import {
  PartyRepresentationProvider,
  usePartyRepresentation,
} from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { ReporteeAccessPackageSection } from './ReporteeAccessPackageSection';
import { ReporteeRoleSection } from './ReporteeRoleSection';

export const ReporteeRightsPage = () => {
  const { t } = useTranslation();
  const { id: reporteeUuid } = useParams();

  const { toParty, fromParty } = usePartyRepresentation();

  useDocumentTitle(t('user_rights_page.page_title'));
  const name = reporteeUuid ? fromParty?.name : '';

  const { data: allAccesses } = useGetUserAccessesQuery({
    from: reporteeUuid ?? '',
    to: getCookie('AltinnPartyUuid'),
  });

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
                userName={name}
                userType={fromParty?.partyTypeName}
                secondaryAvatarName={toParty?.name}
                secondaryAvatarType={toParty?.partyTypeName}
                subHeading={t('reportee_rights_page.heading_subtitle', { name: toParty?.name })}
                roles={
                  !displayLimitedPreviewLaunch &&
                  !!toParty?.partyUuid &&
                  !!fromParty?.partyUuid && (
                    <UserRoles
                      rightOwnerUuid={toParty.partyUuid}
                      rightHolderUuid={fromParty.partyUuid}
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
  );
};
