import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PersonGroupIcon } from '@navikt/aksel-icons';
import { AmTabs } from '../common/AmTabs/AmTabs';

type ClientDetailsTabsProps = {
  activeTab: string;
  onChange: (value: string) => void;
  hasUsersContent: ReactNode;
  allUsersContent: ReactNode;
};

export const ClientDetailsTabs = ({
  activeTab,
  onChange,
  hasUsersContent,
  allUsersContent,
}: ClientDetailsTabsProps) => {
  const { t } = useTranslation();

  return (
    <AmTabs
      defaultValue='has-users'
      value={activeTab}
      onChange={onChange}
    >
      <AmTabs.List>
        <AmTabs.Tab
          value='has-users'
          label={t('client_administration_page.client_has_agents_tab')}
          icon={<PersonGroupIcon aria-hidden='true' />}
        />
        <AmTabs.Tab
          value='all-users'
          label={t('client_administration_page.client_can_get_agents_tab')}
          icon={<PersonGroupIcon aria-hidden='true' />}
        />
      </AmTabs.List>
      <AmTabs.Panel value='has-users'>{hasUsersContent}</AmTabs.Panel>
      <AmTabs.Panel value='all-users'>{allUsersContent}</AmTabs.Panel>
    </AmTabs>
  );
};
