import React from 'react';

import { ClientAdministrationAgentDetails } from './ClientAdministrationAgentDetails';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { Navigate, useParams } from 'react-router';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';
import { DsAlert } from '@altinn/altinn-components';
import { t } from 'i18next';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';

export const ClientAdministrationAgentDetailsPage = () => {
  const { id } = useParams();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const pageIsEnabled = clientAdministrationPageEnabled();
  if (!pageIsEnabled) {
    return (
      <Navigate
        to='/not-found'
        replace
      />
    );
  }

  if (isClientAdmin === false) {
    return (
      <DsAlert data-color='warning'>{t('client_administration_page.no_access_title')}</DsAlert>
    );
  }

  return (
    <PartyRepresentationProvider
      fromPartyUuid={getCookie('AltinnPartyUuid')}
      actingPartyUuid={getCookie('AltinnPartyUuid')}
      toPartyUuid={id}
      errorOnPriv={true}
    >
      <ClientAdministrationAgentDetails />
    </PartyRepresentationProvider>
  );
};
