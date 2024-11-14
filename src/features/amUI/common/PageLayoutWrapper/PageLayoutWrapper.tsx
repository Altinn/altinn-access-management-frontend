import { Layout } from '@altinn/altinn-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PageLayoutWrapperProps {
  reporteeName: string;
  children?: React.ReactNode;
}

export const PageLayoutWrapper = ({
  reporteeName,
  children,
}: PageLayoutWrapperProps): React.ReactNode => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <Layout
      theme={'neutral'}
      header={{
        menu: {
          menuLabel: t('header.menu-label'),
          accounts: [
            {
              name: reporteeName,
              selected: true,
              type: 'person',
            },
          ],
          expanded: false,
          onToggle: () => {
            setMenuOpen(!menuOpen);
          },
          items: [],
          variant: 'dropdown',
        },
      }}
      sidebar={{
        menu: {
          groups: {},
          items: [
            {
              group: 1,
              icon: 'buildings2',
              id: '1',
              size: 'lg',
              title: 'Bedriftsprofil',
            },
            {
              group: 2,
              icon: 'person-group',
              id: '2',
              title: 'Brukere',
            },
            {
              group: 2,
              icon: 'handshake',
              id: '3',
              title: 'Fullmakter',
            },
            {
              group: 3,
              icon: 'inbox',
              id: '4',
              title: 'Våre tilganger hos andre',
            },
            {
              group: 3,
              icon: 'database',
              id: '5',
              title: 'Klientdelegering',
            },
            {
              group: 4,
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
  );
};
