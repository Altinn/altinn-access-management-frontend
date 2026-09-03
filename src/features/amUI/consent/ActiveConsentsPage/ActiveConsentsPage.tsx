import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { formatDisplayName } from '@altinn/altinn-components';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';
import { ReporteePageHeading } from '../../common/ReporteePageHeading';

import { ActiveConsentsPageContent } from './ActiveConsentsPageContent';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission } from '@/resources/utils/permissionUtils';
import { useGetIdPortenAuthorizationsQuery } from '@/rtk/features/idPortenAuthorizationApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();

  const routerLocation = useLocation();

  useDocumentTitle(t('active_consents.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const newlyCreatedId = routerLocation?.state?.createdId;

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetPartyFromLoggedInUserQuery();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const hasPermission = hasConsentPermission(
    reportee,
    isAdmin,
    currentUser?.partyUuid === reportee?.partyUuid,
  );

  const {
    data: activeConsents,
    isLoading: isLoadingActiveConsents,
    error: loadActiveConsentsError,
  } = useGetActiveConsentsQuery({ partyId: partyUuid }, { skip: !partyUuid || !hasPermission });

  const {
    data: idPortenAuthorizations,
    isLoading: isLoadingIdPortenAuthorizations,
    error: loadIdPortenAuthorizationsError,
  } = useGetIdPortenAuthorizationsQuery(undefined, {
    skip: !hasPermission || window.featureFlags?.showIdPortenAuthorizations !== true,
  });

  const isLoading =
    isLoadingReportee ||
    isCurrentUserLoading ||
    isLoadingIsAdmin ||
    isLoadingActiveConsents ||
    isLoadingIdPortenAuthorizations;

  const reporteeName = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'consent']} />
        <ReporteePageHeading
          title={t('active_consents.heading', { name: reporteeName })}
          reportee={reportee}
          isLoading={isLoadingReportee}
        />
        <ActiveConsentsPageContent
          activeConsents={activeConsents}
          idPortenAuthorizations={idPortenAuthorizations}
          reportee={reportee}
          isLoading={isLoading}
          hasPermission={hasPermission}
          loadActiveConsentsError={loadActiveConsentsError}
          loadIdPortenAuthorizationsError={loadIdPortenAuthorizationsError}
          newlyCreatedId={newlyCreatedId}
        />
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
