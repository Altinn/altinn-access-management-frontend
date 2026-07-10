import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DatabaseIcon } from '@navikt/aksel-icons';
import { AmTabs } from '../common/AmTabs/AmTabs';

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
    <AmTabs
      defaultValue='has-clients'
      value={activeTab}
      onChange={onChange}
    >
      <AmTabs.List>
        <AmTabs.Tab
          value='has-clients'
          label={t('client_administration_page.agent_has_clients_tab')}
          icon={<DatabaseIcon aria-hidden='true' />}
        />
        <AmTabs.Tab
          value='all-clients'
          label={t('client_administration_page.agent_can_get_clients_tab')}
          icon={<DatabaseIcon aria-hidden='true' />}
        />
      </AmTabs.List>
      <AmTabs.Panel value='has-clients'>{hasClientsContent}</AmTabs.Panel>
      <AmTabs.Panel value='all-clients'>{canGetClientsContent}</AmTabs.Panel>
    </AmTabs>
  );
};
