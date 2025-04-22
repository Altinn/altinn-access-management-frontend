import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@digdir/designsystemet-react';
import { useParams } from 'react-router';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { UserRoles } from '../common/UserRoles/UserRoles';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { AccessPackageSection } from './AccessPackageSection/AccessPackageSection';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';
import { RoleSection } from './RoleSection/RoleSection';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { useGetReporteeQuery, useGetUserAccessesQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { filterDigdirRole } from '@/resources/utils/roleUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));

  const { data: allAccesses, isLoading } = useGetUserAccessesQuery({
    from: getCookie('AltinnPartyUuid'),
    to: id ?? '',
  });

  rerouteIfNotConfetti();

  const { displayLimitedPreviewLaunch } = window.featureFlags;

  return (
    <PageWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={getCookie('AltinnPartyUuid')}
        toPartyUuid={id ?? ''}
      >
        <DelegationModalProvider>
          <PageLayoutWrapper>
            <PageContainer backUrl={`/${amUIPath.Users}`}>
              {!isLoading && allAccesses ? (
                <>
                  <UserPageHeader
                    userName={party?.name}
                    userType={party?.partyTypeName}
                    subHeading={`for ${reportee?.name}`}
                    roles={
                      displayLimitedPreviewLaunch &&
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
                      accessPackages: allAccesses.accessPackages?.length ?? 0,
                      services: allAccesses.services?.length ?? 0,
                      roles: filterDigdirRole(allAccesses.roles).length ?? 0,
                    }}
                    packagesPanel={
                      <AccessPackageSection numberOfAccesses={allAccesses.accessPackages?.length} />
                    }
                    singleRightsPanel={<SingleRightsSection />}
                    roleAssignmentsPanel={
                      <RoleSection numberOfAccesses={allAccesses.accessPackages?.length} />
                    }
                  />
                </>
              ) : (
                // TODO: Add proper aria-label for loading
                <Spinner aria-label='loading' />
              )}
            </PageContainer>
          </PageLayoutWrapper>
        </DelegationModalProvider>
      </PartyRepresentationProvider>
    </PageWrapper>
  );
};
