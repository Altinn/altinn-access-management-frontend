import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsTabs } from '@altinn/altinn-components';

type ClientAdministrationClientTabsProps = {
  activeTab: string;
  onChange: (value: string) => void;
  hasUsersContent: ReactNode;
  allUsersContent: ReactNode;
};

export const ClientAdministrationClientTabs = ({
  activeTab,
  onChange,
  hasUsersContent,
  allUsersContent,
}: ClientAdministrationClientTabsProps) => {
  const { t } = useTranslation();

  return (
    <DsTabs
      defaultValue='has-users'
      data-size='sm'
      value={activeTab}
      onChange={onChange}
    >
      <DsTabs.List>
        <DsTabs.Tab value='has-users'>
          {t('client_administration_page.client_has_agents_tab')}
        </DsTabs.Tab>
        <DsTabs.Tab value='all-users'>
          {t('client_administration_page.client_can_get_agents_tab')}
        </DsTabs.Tab>
      </DsTabs.List>
      <DsTabs.Panel value='has-users'>{hasUsersContent}</DsTabs.Panel>
      <DsTabs.Panel value='all-users'>{allUsersContent}</DsTabs.Panel>
    </DsTabs>
  );
};
