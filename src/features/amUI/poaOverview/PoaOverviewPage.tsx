import React from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { rerouteIfNotLimitedPreview } from '@/resources/utils/featureFlagUtils';

import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { RightsTabs } from '../common/RightsTabs/RightsTabs';

export const PoaOverviewPage = () => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  useDocumentTitle(t('poa_overview_page.page_title'));

  // rerouteIfNotLimitedPreview();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <DsHeading
            level={1}
            data-size='lg'
          >
            {t('poa_overview_page.heading', { fromparty: reportee?.name || '' })}
          </DsHeading>
          <RightsTabs
            packagesPanel={
              <AccessPackageList
                showAllAreas
                showAvailableToggle={false}
                showAllPackages
                showPermissions
                showPackagesCount={false}
              />
            }
            singleRightsPanel={'Kommer snart'}
            roleAssignmentsPanel={'Kommer snart'}
          />
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
