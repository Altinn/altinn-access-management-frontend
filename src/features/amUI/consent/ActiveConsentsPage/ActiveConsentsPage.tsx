import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { DsDialog, formatDisplayName } from '@altinn/altinn-components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { ConsentDetails } from '../components/ConsentDetails/ConsentDetails';
import classes from './ActiveConsentsPage.module.css';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission } from '@/resources/utils/permissionUtils';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';
import { ReporteePageHeading } from '../../common/ReporteePageHeading';
import {
  IdPortenAuthorization,
  useGetIdPortenAuthorizationsQuery,
} from '@/rtk/features/idPortenAuthorizationApi';
import { IdPortenAutorizationDetails } from '../components/IdPortenAutorizationDetails/IdPortenAutorizationDetails';
import { ActiveConsentsPageContent } from './ActiveConsentsPageContent';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';

export const ActiveConsentsPage = () => {
  const { t } = useTranslation();

  const routerLocation = useLocation();

  const consentModalRef = useRef<HTMLDialogElement>(null);
  const [selectedConsentId, setSelectedConsentId] = useState<string>('');
  const [selectedIdPortenAuthorization, setSelectedIdPortenAuthorization] =
    useState<IdPortenAuthorization | null>(null);

  useDocumentTitle(t('active_consents.page_title'));
  const partyUuid = getCookie('AltinnPartyUuid');

  const newlyCreatedId = routerLocation?.state?.createdId;

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetPartyFromLoggedInUserQuery();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const hasPermission = hasConsentPermission(isAdmin);

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
    // ID-porten authorizations are only relevant for the logged in user
    skip:
      !partyUuid ||
      reportee?.type !== 'Person' ||
      currentUser?.partyUuid !== partyUuid ||
      window.featureFlags?.idPortenAuthorization !== true,
  });

  const isLoading =
    isLoadingReportee ||
    isCurrentUserLoading ||
    isLoadingIsAdmin ||
    isLoadingActiveConsents ||
    isLoadingIdPortenAuthorizations;

  const showConsentDetails = (consentId: string, consentType: 'altinn' | 'idporten'): void => {
    consentModalRef.current?.showModal();
    if (consentType === 'altinn') {
      setSelectedConsentId(consentId);
    } else {
      const idPortenAuthorization = idPortenAuthorizations?.find(
        (x) => x.authorization_id === consentId,
      );
      setSelectedIdPortenAuthorization(idPortenAuthorization || null);
    }
  };

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
          showConsentDetails={showConsentDetails}
        />
        <DsDialog
          ref={consentModalRef}
          className={classes.consentDialog}
          closedby='any'
          onClose={() => {
            setSelectedConsentId('');
            setSelectedIdPortenAuthorization(null);
          }}
        >
          {selectedConsentId && <ConsentDetails consentId={selectedConsentId} />}
          {selectedIdPortenAuthorization && (
            <IdPortenAutorizationDetails
              idPortenAuthorization={selectedIdPortenAuthorization}
              onRevoked={() => consentModalRef.current?.close()}
            />
          )}
        </DsDialog>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
