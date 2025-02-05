import { Layout, MenuItem } from '@altinn/altinn-components';
import { RootProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { amUIPath } from '@/routes/paths';

interface PageLayoutWrapperProps {
  children?: React.ReactNode;
}

export const PageLayoutWrapper = ({ children }: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  return (
    <RootProvider>
      <Layout
        color={'neutral'}
        theme='subtle'
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
                icon: 'handshake',
                id: '1',
                size: 'lg',
                title: 'Tilgangsstyring',
              },
              {
                groupId: 2,
                id: '2',
                as: () => (
                  <Link to={`/${amUIPath.Users}`}>
                    <MenuItem
                      as='div'
                      id={'users'}
                      title={t('sidebar.users')}
                      icon='person-group'
                    />
                  </Link>
                ),
              },
              {
                groupId: 3,
                id: '3',
                as: () => (
                  <Link to={`/${amUIPath.Reportees}`}>
                    <MenuItem
                      id={'inbox'}
                      title={t('sidebar.reportees')}
                      icon='inbox'
                    />
                  </Link>
                ),
              },
            ],
          },
        }}
        content={{ color: 'neutral' }}
        footer={{
          address: 'Postboks 1382 Vika, 0114 Oslo.',
          address2: 'Org.nr. 991 825 827',
          menu: {
            items: [
              {
                id: '1',
                title: 'Om Altinn',
              },
              {
                id: '2',
                title: 'Driftsmeldinger',
              },
              {
                id: '3',
                title: 'Personvern',
              },
              {
                id: '4',
                title: 'Tilgjengelighet',
              },
            ],
          },
        }}
      >
        {children}
      </Layout>
    </RootProvider>
  );
};
