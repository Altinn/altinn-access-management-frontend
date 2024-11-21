import { Layout } from '@altinn/altinn-components';
import { RootProvider } from '@altinn/altinn-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  // const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <RootProvider>
      <Layout
        theme={'neutral'}
        header={{
          currentAccount: {
            name: reportee?.name || '',
            type: reportee?.type === 'Organization' ? 'company' : 'person',
            id: reportee?.name || '',
          },
          menu: {
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            accounts: [
              {
                name: reportee?.name || '',
                selected: true,
                type: reportee?.type === 'Organization' ? 'company' : 'person',
                id: reportee?.name || '',
              },
              {
                name: 'Test',
                type: 'person',
                id: 'test',
              },
            ],
            items: [],
          },
        }}
        sidebar={{
          menu: {
            groups: {},
            items: [
              {
                groupId: 1,
                icon: 'buildings2',
                id: '1',
                size: 'lg',
                title: 'Bedriftsprofil',
              },
              {
                groupId: 2,
                id: '2',
                icon: 'person-group',
                title: 'Brukere',
              },
              {
                groupId: 2,
                icon: 'handshake',
                id: '3',
                title: 'Fullmakter',
              },
              {
                groupId: 3,
                icon: 'inbox',
                id: '4',
                title: 'Våre tilganger hos andre',
              },
              {
                groupId: 3,
                icon: 'database',
                id: '5',
                title: 'Klientdelegering',
              },
              {
                groupId: 4,
                icon: 'clock-dashed',
                id: '6',
                title: 'Aktivitetslogg',
              },
            ],
          },
        }}
        content={{ theme: 'neutral' }}
      >
        {children}
      </Layout>
    </RootProvider>
  );
};
