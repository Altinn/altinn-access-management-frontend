import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, DsAlert, DsParagraph, ListItem, ListItemLabel } from '@altinn/altinn-components';

import {
  formatEntityDisplayName,
  getFormattedDateOfBirthLabel,
} from '@/resources/utils/reporteeUtils';
import {
  isBankruptcyEstateAdministrationAvailable,
  hasBankruptcyEstateAdminPermission,
} from '@/resources/utils/permissionUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { useGetIsBankruptcyEstateAdminQuery } from '@/rtk/features/bankruptcyEstateApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ReporteePageHeading } from '../common/ReporteePageHeading/ReporteePageHeading';

import { AddAdministratorButton } from './AddAdministratorButton';
import { AdministratorInfoPopover } from './AdministratorInfoPopover';
import classes from './BankruptcyEstateAdministrationPage.module.css';

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
  const trusteeName = formatEntityDisplayName(actingParty);

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
    <>
      <ReporteePageHeading
        title={t('bankruptcy_estate_administration_page.page_heading', {
          name: formatEntityDisplayName(actingParty),
        })}
        reportee={reportee}
        isLoading={isLoading}
      />
      {!isLoading && hasPermission && (
        <>
          <div className={classes.trustee}>
            <ListItem
              id={actingParty?.id ?? ''}
              icon={{ type: 'person', name: trusteeName }}
              ariaLabel={trusteeName}
              label={
                <div className={classes.trusteeLabel}>
                  <ListItemLabel
                    title={{ children: trusteeName, as: 'div' }}
                    description={getFormattedDateOfBirthLabel(actingParty?.dateOfBirth)}
                    size='md'
                  />
                  <Badge
                    label={t('bankruptcy_estate_administration_page.trustee')}
                    color='company'
                  />
                </div>
              }
              color='company'
              size='md'
              as='div'
              containerAs='div'
              interactive={false}
              className={classes.trusteeItem}
            />
          </div>
          <AdministratorInfoPopover>
            {t('bankruptcy_estate_administration_page.intro')}
          </AdministratorInfoPopover>
          <AddAdministratorButton />
        </>
      )}
    </>
  );
};
