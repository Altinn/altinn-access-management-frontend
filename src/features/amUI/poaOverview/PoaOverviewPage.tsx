import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading';

import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { AccessPackagePermissions } from './AccessPackagePermissions';
import {
  displayInstanceDelegation,
  useRerouteIfPoaOverviewPageDisabled,
} from '@/resources/utils/featureFlagUtils';
import { formatDisplayName } from '@altinn/altinn-components';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { GuardianshipPermissions } from './GuardianshipPermissions';
import { InstancePermissions } from './InstancePermissions';
import classes from './PoaOverviewPage.module.css';

export const PoaOverviewPage = () => {
  const { t } = useTranslation();
  const { data: reportee, isLoading } = useGetReporteeQuery();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const instanceDelegationEnabled = displayInstanceDelegation();
  const name = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  useDocumentTitle(t('poa_overview_page.page_title'));

  const partyUuid = getCookie('AltinnPartyUuid') || undefined;
  const showInstancesTab = instanceDelegationEnabled;
  useRerouteIfPoaOverviewPageDisabled();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {!isAdmin && !isLoadingIsAdmin ? (
          <DsAlert data-color='warning'>{t('poa_overview_page.no_access_title')}</DsAlert>
        ) : (
          <PartyRepresentationProvider
            fromPartyUuid={partyUuid}
            actingPartyUuid={partyUuid ?? ''}
            errorOnPriv={true}
          >
            <Breadcrumbs items={['root', 'poa_overview']} />
            <ReporteePageHeading
              title={t('poa_overview_page.heading', { name })}
              reportee={reportee}
              isLoading={isLoading}
            />
            <RightsTabs
              packagesPanel={<AccessPackagePermissions />}
              singleRightsPanel={null}
              instancesPanel={showInstancesTab ? <InstancePermissions /> : null}
              roleAssignmentsPanel={null}
              guardianshipsPanel={<GuardianshipPermissions />}
              tabProps={{ className: classes.tab }}
            />
          </PartyRepresentationProvider>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
