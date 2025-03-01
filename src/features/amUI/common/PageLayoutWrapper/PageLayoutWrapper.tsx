import { Layout, RootProvider } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { HandshakeIcon, PersonGroupIcon, InboxIcon, TenancyIcon } from '@navikt/aksel-icons';

import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { amUIPath, SystemUserPath } from '@/routes/paths';
import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';

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
          logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
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
                icon: HandshakeIcon,
                id: '1',
                size: 'lg',
                title: 'Tilgangsstyring',
              },
              {
                groupId: 2,
                id: '2',
                title: t('sidebar.users'),
                icon: PersonGroupIcon,
                as: (props) => (
                  <Link
                    to={`/${amUIPath.Users}`}
                    {...props}
                  />
                ),
              },
              {
                groupId: 3,
                id: '3',
                title: t('sidebar.reportees'),
                icon: InboxIcon,
                as: (props) => (
                  <Link
                    to={`/${amUIPath.Reportees}`}
                    {...props}
                  />
                ),
              },
              {
                groupId: 4,
                id: '4',
                title: t('sidebar.systemaccess'),
                icon: TenancyIcon,
                as: (props) => (
                  <Link
                    to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}
                    {...props}
                  />
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
            items: footerLinks.map((link) => ({
              href: link.href,
              id: link.resourceId,
              title: t(link.resourceId),
            })),
          },
        }}
      >
        {children}
      </Layout>
    </RootProvider>
  );
};

const footerLinks = [
  {
    href: 'https://info.altinn.no/om-altinn/',
    resourceId: 'footer.about_altinn',
  },
  {
    href: 'https://info.altinn.no/om-altinn/driftsmeldinger/',
    resourceId: 'footer.service_messages',
  },
  {
    href: 'https://info.altinn.no/om-altinn/personvern/',
    resourceId: 'footer.privacy_policy',
  },
  {
    href: 'https://info.altinn.no/om-altinn/tilgjengelighet/',
    resourceId: 'footer.accessibility',
  },
];
