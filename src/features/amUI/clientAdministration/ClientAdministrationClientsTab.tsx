import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, Switch } from '@altinn/altinn-components';

import { AdvancedUserSearch } from '../common/AdvancedUserSearch/AdvancedUserSearch';
import { type Client, useGetClientsQuery } from '@/rtk/features/clientApi';
import { type Connection } from '@/rtk/features/connectionApi';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';
import { SelectRoleFilter } from './SelectRoleFilter';
import classes from './ClientAdministrationAgentsTab.module.css';

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
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClientsQuery({ roles: roleFilter });

  const filteredClients = useMemo(() => {
    if (!clients || showDeleted) {
      return clients;
    }
    return clients.filter((client) => !client.client?.isDeleted);
  }, [clients, showDeleted]);
  const clientConnections = useMemo<Connection[]>(
    () => buildClientConnections(filteredClients),
    [filteredClients],
  );

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
    <>
      <AdvancedUserSearch
        includeSelfAsChild={true}
        connections={clientConnections}
        isLoading={isClientsLoading}
        canDelegate={false}
        searchPlaceholder={t('client_administration_page.client_search_placeholder')}
        noUsersText={t('client_administration_page.no_clients')}
        getUserLink={(user) => `/clientadministration/client/${user.id}`}
        hasActiveAdditionalFilters={roleFilter.length > 0 || !showDeleted}
        additionalFilters={
          <div className={classes.filters}>
            <SelectRoleFilter
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
            <Switch
              onChange={(e) => setShowDeleted(e.target.checked)}
              checked={showDeleted}
              label={t('client_administration_page.show_deleted_clients')}
            />
          </div>
        }
      />
    </>
  );
};
