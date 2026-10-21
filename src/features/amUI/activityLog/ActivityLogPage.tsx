import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import { PageWrapper } from '@/components';
import { formatEntityDisplayName, isOrganization } from '@/resources/utils/reporteeUtils';
import { hasActivityLogPermission } from '@/resources/utils/permissionUtils';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTabState } from '@/resources/hooks';
import {
  useGetIsAdminQuery,
  useGetIsMaskinportenAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';

import { AmTabs } from '../common/AmTabs/AmTabs';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { ReporteePageHeading } from '../common/ReporteePageHeading';

import { ActivityLogTab } from './ActivityLogTab';
import { type ActivityLogArea, activityLogAreas } from './types';

const tabLabelKeys: Record<ActivityLogArea, string> = {
  connections: 'activity_log_page.tab_connections',
  request: 'activity_log_page.tab_request',
  maskinporten: 'activity_log_page.tab_maskinporten',
};

export const ActivityLogPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('activity_log_page.document_title'));

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isMaskinportenAdmin, isLoading: isLoadingIsMaskinportenAdmin } =
    useGetIsMaskinportenAdminQuery(undefined, { skip: !isOrganization(reportee) });
  const reporteeName = formatEntityDisplayName(reportee);

  const isLoadingPermissions =
    isLoadingReportee || isLoadingIsAdmin || isLoadingIsMaskinportenAdmin;
  const hasAccess = hasActivityLogPermission(isAdmin, isMaskinportenAdmin);

  // The Maskinporten area is for Maskinporten administrators; the other areas are for access managers.
  const availableAreas = activityLogAreas.filter((area) =>
    area === 'maskinporten' ? isMaskinportenAdmin === true : isAdmin === true,
  );
  const [activeTab, setActiveTab] = useTabState({
    tabs: availableAreas,
    defaultTab: availableAreas[0] ?? activityLogAreas[0],
  });

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {!isLoadingPermissions && !hasAccess ? (
          <DsAlert
            data-color='warning'
            role='alert'
          >
            {t('activity_log_page.no_access')}
          </DsAlert>
        ) : (
          <>
            <Breadcrumbs items={['root', 'activity_log']} />
            <ReporteePageHeading
              title={t('activity_log_page.heading', { name: reporteeName })}
              reportee={reportee}
              isLoading={isLoadingPermissions}
            />
            {!isLoadingPermissions && (
              <AmTabs
                value={activeTab}
                onChange={setActiveTab}
              >
                <AmTabs.List>
                  {availableAreas.map((area) => (
                    <AmTabs.Tab
                      key={area}
                      value={area}
                      label={t(tabLabelKeys[area])}
                    />
                  ))}
                </AmTabs.List>
                {availableAreas.map((area) => (
                  <AmTabs.Panel
                    key={area}
                    value={area}
                  >
                    <ActivityLogTab
                      area={area}
                      reporteeName={reporteeName}
                    />
                  </AmTabs.Panel>
                ))}
              </AmTabs>
            )}
          </>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
