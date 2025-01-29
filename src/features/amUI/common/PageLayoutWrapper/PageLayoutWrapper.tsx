import { Layout } from '@altinn/altinn-components';
import { RootProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

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
                icon: 'person-group',
                title: 'Brukere',
              },
              {
                groupId: 3,
                icon: 'inbox',
                id: '3',
                title: 'Våre tilganger hos andre',
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
