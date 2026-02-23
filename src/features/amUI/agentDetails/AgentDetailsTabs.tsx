import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsTabs } from '@altinn/altinn-components';
import { DatabaseIcon } from '@navikt/aksel-icons';

type AgentDetailsTabsProps = {
  activeTab: string;
  onChange: (value: string) => void;
  hasClientsContent: ReactNode;
  canGetClientsContent: ReactNode;
};

export const AgentDetailsTabs = ({
  activeTab,
  onChange,
  hasClientsContent,
  canGetClientsContent,
}: AgentDetailsTabsProps) => {
  const { t } = useTranslation();

  return (
    <DsTabs
      defaultValue='has-clients'
      data-size='sm'
      value={activeTab}
      onChange={onChange}
    >
      <DsTabs.List>
        <DsTabs.Tab value='has-clients'>
          <DatabaseIcon aria-hidden='true' />
          {t('client_administration_page.agent_has_clients_tab')}
        </DsTabs.Tab>
        <DsTabs.Tab value='all-clients'>
          <DatabaseIcon aria-hidden='true' />
          {t('client_administration_page.agent_can_get_clients_tab')}
        </DsTabs.Tab>
      </DsTabs.List>
      <DsTabs.Panel value='has-clients'>{hasClientsContent}</DsTabs.Panel>
      <DsTabs.Panel value='all-clients'>{canGetClientsContent}</DsTabs.Panel>
    </DsTabs>
  );
};
