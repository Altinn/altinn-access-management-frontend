import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { type Client, useGetClientsQuery } from '@/rtk/features/clientApi';
import { type Connection } from '@/rtk/features/connectionApi';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';

const buildClientConnections = (clients?: Client[]): Connection[] => {
  if (!clients?.length) return [];

  const parentNameById = buildClientParentNameById(clients);

  return clients.map((client) => {
    const sortKey = buildClientSortKey(client, parentNameById);
    return {
      party: {
        ...client.client,
        children: null,
        parent: null,
        roles: [],
      },
      sortKey,
      roles: [],
      connections: [],
    };
  });
};

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
      getUserLink={(user) => `/clientadministration/client/${user.id}`}
    />
  );
};
