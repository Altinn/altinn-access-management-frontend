import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
} from '@altinn/altinn-components';
import { useParams } from 'react-router';

import { amUIPath } from '@/routes/paths';
import { PartyType, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { Breadcrumbs } from '../common/Breadcrumbs/Breadcrumbs';

export const ClientAdministrationClientDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { fromParty } = usePartyRepresentation();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();

  if (isLoadingIsClientAdmin) {
    return (
      <>
        <DsHeading data-size='lg'>
          <DsSkeleton variant='text'>{t('client_administration_page.page_heading')}</DsSkeleton>
        </DsHeading>
        <DsParagraph data-size='lg'>
          <DsSkeleton
            variant='text'
            width={40}
          />
        </DsParagraph>
      </>
    );
  }

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  const backUrl = `/${amUIPath.ClientAdministration}`;
  const clientName = formatDisplayName({
    fullName: fromParty?.name || '',
    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

  return (
    <>
      <Breadcrumbs
        items={['root', 'client_administration']}
        lastBreadcrumb={{
          label: clientName,
        }}
      />
      <PageContainer backUrl={backUrl}>
        <DsHeading data-size='lg'>{clientName}</DsHeading>
        {!id && (
          <DsAlert data-color='warning'>
            <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          </DsAlert>
        )}
      </PageContainer>
    </>
  );
};
