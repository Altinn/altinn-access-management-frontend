import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import {
  isBankruptcyEstateAdministrationAvailable,
  hasBankruptcyEstateAdminPermission,
} from '@/resources/utils/permissionUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetIsBankruptcyEstateAdminQuery } from '@/rtk/features/bankruptcyEstateApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading/ReporteePageHeading';

export const BankruptcyEstateAdministrationPageContent = () => {
  const { t } = useTranslation();
  const { actingParty, isLoading: actorLoading } = usePartyRepresentation();
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const {
    data: isBankruptcyEstateAdmin,
    isLoading: isLoadingIsBankruptcyEstateAdmin,
    isError,
  } = useGetIsBankruptcyEstateAdminQuery(undefined, {
    skip: !isBankruptcyEstateAdministrationAvailable(reportee),
  });

  const isLoading = isLoadingReportee || actorLoading || isLoadingIsBankruptcyEstateAdmin;
  const hasPermission = hasBankruptcyEstateAdminPermission(reportee, isBankruptcyEstateAdmin);

  if (isError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  if (!isLoading && hasPermission === false) {
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
