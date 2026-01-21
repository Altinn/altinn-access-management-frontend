import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { type Client, useGetClientsQuery } from '@/rtk/features/clientApi';
import { type Connection } from '@/rtk/features/connectionApi';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

const buildClientSortKey = (client: Client, parentNameById: Map<string, string>): string => {
  const parentId = client.client.parent?.id;
  const isSubUnit = Boolean(parentId) && isSubUnitByType(client.client.variant);
  const parentName =
    (parentId ? parentNameById.get(parentId) : undefined) ??
    client.client.parent?.name ??
    client.client.name;
  const groupName = isSubUnit ? parentName : client.client.name;
  const groupId = isSubUnit && parentId ? parentId : client.client.id;
  return `${groupName}|${groupId}|${isSubUnit ? '1' : '0'}|${client.client.name}`;
};

const buildClientConnections = (clients?: Client[]): Connection[] => {
  if (!clients?.length) return [];

  const parentNameById = new Map<string, string>();
  clients.forEach((client) => {
    if (client.client?.id) {
      parentNameById.set(client.client.id, client.client.name);
    }
  });

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
