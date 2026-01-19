import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { type Client, useGetClientsQuery } from '@/rtk/features/clientApi';
import { type Connection } from '@/rtk/features/connectionApi';

const buildClientConnections = (clients?: Client[]): Connection[] =>
  clients?.map((client) => ({
    party: {
      ...client.client,
      children: null,
      parent: null,
      roles: [],
    },
    roles: [],
    connections: [],
  })) ?? [];

export const ClientAdministrationClientsTab = () => {
  const { t } = useTranslation();
  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClientsQuery();

  const clientConnections = useMemo<Connection[]>(() => buildClientConnections(clients), [clients]);

  if (isClientsError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <AdvancedUserSearch
      includeSelfAsChild={true}
      connections={clientConnections}
      isLoading={isClientsLoading}
      canDelegate={false}
      noUsersText={t('client_administration_page.no_clients')}
    />
  );
};
