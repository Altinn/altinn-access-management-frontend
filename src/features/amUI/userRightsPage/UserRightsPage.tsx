import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsSpinner } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import {
  PartyType,
  useGetReporteeQuery,
  useGetRightHoldersQuery,
} from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';

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
import { DeleteUserModal } from './DeleteUserModal';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: reportee } = useGetReporteeQuery();
  const { data: userConnection, isLoading: userIsLoading } = useGetRightHoldersQuery(
    {
      partyUuid: getCookie('AltinnPartyUuid'),
      fromUuid: getCookie('AltinnPartyUuid'),
      toUuid: id ?? '',
    },
    { skip: id === undefined },
  );

  const userName = userConnection?.[0]?.name ?? '';
  const userUuid = userConnection?.[0]?.partyUuid ?? '';
  const userType = userConnection?.[0]?.partyType ?? PartyType.Person;

  useDocumentTitle(t('user_rights_page.page_title'));

  const isLoading = userIsLoading;

  rerouteIfNotConfetti();

  const { displayLimitedPreviewLaunch } = window.featureFlags;

  if (!userConnection || !reportee) {
    return null;
  }

  return (
    <PageWrapper>
      <PartyRepresentationProvider
        actingPartyUuid={getCookie('AltinnPartyUuid')}
        fromPartyUuid={getCookie('AltinnPartyUuid')}
        toPartyUuid={userConnection && id ? id : undefined}
      >
        <DelegationModalProvider>
          <PageLayoutWrapper>
            <PageContainer
              backUrl={`/${amUIPath.Users}`}
              contentActions={
                <DeleteUserModal
                  userName={userName}
                  userUuid={userUuid}
                  reporteeName={reportee?.name}
                />
              }
            >
              {!isLoading ? (
                <>
                  <UserPageHeader
                    userName={userName}
                    userType={userType}
                    subHeading={`for ${reportee?.name}`}
                    roles={
                      !displayLimitedPreviewLaunch &&
                      !!reportee?.partyUuid &&
                      !!userUuid && (
                        <UserRoles
                          rightOwnerUuid={reportee.partyUuid}
                          rightHolderUuid={userUuid}
                        />
                      )
                    }
                  />
                  <RightsTabs
                    packagesPanel={<AccessPackageSection numberOfAccesses={0} />}
                    singleRightsPanel={<SingleRightsSection />}
                    roleAssignmentsPanel={<RoleSection numberOfAccesses={0} />}
                  />
                </>
              ) : (
                // TODO: Add proper aria-label for loading
                <DsSpinner aria-label='loading' />
              )}
            </PageContainer>
          </PageLayoutWrapper>
        </DelegationModalProvider>
      </PartyRepresentationProvider>
    </PageWrapper>
  );
};
