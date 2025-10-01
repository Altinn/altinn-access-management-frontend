import React from 'react';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading';
import classes from './PoaOverviewPage.module.css';

import { RightsTabs } from '../common/RightsTabs/RightsTabs';
import { AccessPackagePermissions } from './AccessPackagePermissions';
import { useRerouteIfLimitedPreview } from '@/resources/utils/featureFlagUtils';

export const PoaOverviewPage = () => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();

  useDocumentTitle(t('poa_overview_page.page_title'));

  const partyUuid = getCookie('AltinnPartyUuid') || undefined;

  useRerouteIfLimitedPreview();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={partyUuid}
          actingPartyUuid={partyUuid ?? ''}
        >
          <ReporteePageHeading
            title={t('poa_overview_page.heading', { name: reportee?.name || '' })}
            reportee={reportee}
            className={classes.pageHeading}
          />
          <RightsTabs
            packagesPanel={<AccessPackagePermissions />}
            singleRightsPanel={null}
            roleAssignmentsPanel={null}
          />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
