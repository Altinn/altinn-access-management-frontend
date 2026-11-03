import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import { formatEntityDisplayName, isPerson } from '@/resources/utils/reporteeUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetHasAdminAccessQuery } from '@/rtk/features/bankruptcyEstateApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading/ReporteePageHeading';

export const BankruptcyEstateAdministrationPageContent = () => {
  const { t } = useTranslation();
  const { actingParty, isLoading: actorLoading } = usePartyRepresentation();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: hasAdminAccess, isLoading: isLoadingHasAdminAccess } = useGetHasAdminAccessQuery(
    undefined,
    { skip: !isPerson(reportee) },
  );

  const isLoading = isLoadingReportee || actorLoading || isLoadingHasAdminAccess;

  if (!isLoading && (!isPerson(reportee) || hasAdminAccess === false)) {
    return (
      <DsAlert data-color='warning'>
        {t('bankruptcy_estate_administration_page.no_access_title')}
      </DsAlert>
    );
  }

  return (
    <ReporteePageHeading
      title={t('bankruptcy_estate_administration_page.page_heading', {
        name: formatEntityDisplayName(actingParty),
      })}
      reportee={reportee}
      isLoading={isLoading}
    />
  );
};
