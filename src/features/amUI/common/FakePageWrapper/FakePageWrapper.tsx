import React from 'react';
import { Layout } from 'altinn-components/lib/components/Layout/Layout';

interface FakePageWrapperProps {
  reporteeName: string;
  children?: React.ReactNode;
}

export const FakePageWrapper = ({
  reporteeName,
  children,
}: FakePageWrapperProps): React.ReactNode => {
  return (
    <Layout
      theme={'neutral'}
      header={{
        menu: {
          accounts: [
            {
              name: reporteeName,
              selected: true,
              type: 'person',
            },
          ],
          expanded: false,
          onToggle: () => {},
          items: [],
        },
      }}
      sidebar={{
        menu: {
          groups: {},
          items: [
            {
              badge: '4',
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
              badge: '2',
              group: 2,
              icon: 'handshake',
              id: '3',
              title: 'Fullmakter',
            },
            {
              badge: '11',
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
