import React from 'react';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import classes from './LandingPage.module.css';
import {
  DsAlert,
  DsHeading,
  DsLink,
  formatDisplayName,
  List,
  ListItem,
  MenuItemProps,
} from '@altinn/altinn-components';
import {
  ReporteeInfo,
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';
import { formatDateToNorwegian } from '@/resources/utils';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, BellDotIcon, HandshakeIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router';
import { amUIPath } from '@/routes/paths';
import {
  hasConsentPermission,
  hasSystemClientAdminPermission,
  hasCreateSystemUserPermission,
} from '@/resources/utils/permissionUtils';
import {
  getConsentMenuItem,
  getPoaOverviewMenuItem,
  getReporteesMenuItem,
  getSettingsMenuItem,
  getSystemUserMenuItem,
  getUsersMenuItem,
} from '@/resources/utils/sidebarConfig';

const requestCount = 2;

export const LandingPage = () => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  const { data: isAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings } = useGetIsCompanyProfileAdminQuery();

  const reporteeName = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Person' ? 'person' : 'company',
  });

  const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;
  const displayConsentGui = window.featureFlags?.displayConsentGui;

  const displaySettingsPage = window.featureFlags?.displaySettingsPage;
  const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;

  const getMenuItems = (): MenuItemProps[] => {
    if (!reportee) {
      const loadingMenuItem = {
        icon: HandshakeIcon,
        title: 'xxxxxxxxxxxxxxx',
        description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        href: '',
        loading: true,
      };
      return [loadingMenuItem, loadingMenuItem, loadingMenuItem, loadingMenuItem];
    } else {
      const items = [];
      if (displayConfettiPackage) {
        items.push({
          ...getUsersMenuItem(),
          description:
            reportee.type === 'Organization'
              ? t('landing_page.users_item_description_org')
              : t('landing_page.users_item_description_person'),
        });
        if (isAdmin) {
          items.push({
            ...getReporteesMenuItem(),
            description:
              reportee.type === 'Organization'
                ? t('landing_page.reportees_item_description_org')
                : t('landing_page.reportees_item_description_person'),
          });
        }
      }

      if (displayPoaOverviewPage && isAdmin) {
        items.push({
          ...getPoaOverviewMenuItem(),
          description: t('landing_page.poa_item_description'),
        });
      }

      if (displayConsentGui && hasConsentPermission(reportee, isAdmin)) {
        items.push({
          ...getConsentMenuItem(),
          description: t('landing_page.consent_item_description'),
        });
      }

      if (
        hasCreateSystemUserPermission(reportee) ||
        hasSystemClientAdminPermission(reportee, isClientAdmin)
      ) {
        items.push({
          ...getSystemUserMenuItem(),
          description: t('landing_page.systemuser_item_description'),
        });
      }
      return items;
    }
  };

  const getRequestCountText = (reportee: ReporteeInfo, requestCount: number): string => {
    const name = reportee?.type === 'Organization' ? reporteeName : t('common.you_uppercase');
    const countText = requestCount === 0 ? t('common.none') : requestCount;
    const requestTextKey =
      requestCount === 1 ? 'landing_page.new_requests_single' : 'landing_page.new_requests_plural';

    return t(requestTextKey, {
      reportee: name,
      requestCount: countText,
    });
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.landingPage}>
          <ListItem
            icon={{
              type: reportee?.type === 'Organization' ? 'company' : 'person',
              name: reporteeName,
            }}
            title={formatDisplayName({
              fullName: reportee?.name || '',
              type: reportee?.type === 'Organization' ? 'company' : 'person',
            })}
            description={
              reportee?.type === 'Organization'
                ? `${t('common.org_nr')} ${reportee?.organizationNumber?.match(/.{1,3}/g)?.join(' ') || ''}`
                : `${t('common.date_of_birth')} ${formatDateToNorwegian(reportee?.dateOfBirth)}`
            }
            size='xl'
            loading={!reportee}
            interactive={false}
          />
          <DsAlert data-color='info'>
            <DsHeading
              level={1}
              data-size='xs'
              color='info'
            >
              {t('landing_page.alert_heading')}
            </DsHeading>
            <div className={classes.landingPageAlert}>{t('landing_page.alert_body')}</div>
            <DsLink asChild>
              <Link to={`/${amUIPath.Info}`}>
                {t('landing_page.alert_link')}
                <ArrowRightIcon fontSize={24} />
              </Link>
            </DsLink>
          </DsAlert>
          <ListItemContainer
            heading={t('landing_page.shortcut_links_heading')}
            items={getMenuItems()}
          />
          <ListItemContainer
            heading={t('landing_page.other_links_heading')}
            items={[
              {
                icon: BellDotIcon,
                title: getRequestCountText(reportee!, requestCount),
                as: (props) => (
                  <Link
                    to={`/${'requests'}`}
                    {...props}
                  />
                ),
                loading: !reportee,
              },
              ...(canAccessSettings && displaySettingsPage ? [getSettingsMenuItem()] : []),
            ]}
          />
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface ListItemContainerProps {
  heading: string;
  items: MenuItemProps[];
}
const ListItemContainer = ({ heading, items }: ListItemContainerProps) => {
  return (
    <div>
      <DsHeading
        level={2}
        data-size='xs'
      >
        {heading}
      </DsHeading>
      <List className={classes.listItemContainer}>
        {items.map((item, index) => (
          <ListItem
            key={`${item.href}-${index}`}
            icon={item.icon}
            title={item.title}
            description={item.description}
            size='xs'
            border='none'
            shadow='none'
            linkIcon
            loading={item.loading}
            as={item.as}
          />
        ))}
      </List>
    </div>
  );
};
