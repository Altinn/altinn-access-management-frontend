import React, { useEffect, useState } from 'react';
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
import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Link, useSearchParams } from 'react-router';
import { amUIPath } from '@/routes/paths';
import {
  hasConsentPermission,
  hasSystemUserClientAdminPermission,
  hasCreateSystemUserPermission,
} from '@/resources/utils/permissionUtils';
import {
  getConsentMenuItem,
  getPoaOverviewMenuItem,
  getReporteesMenuItem,
  getRequestsMenuItem,
  getSettingsMenuItem,
  getSystemUserMenuItem,
  getUsersMenuItem,
} from '@/resources/utils/sidebarConfig';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';

export const LandingPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shouldOpenAccountMenu, setShouldOpenAccountMenu] = useState<boolean>(false);
  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin, isLoading: isLoadingIsClientAdmin } = useGetIsClientAdminQuery();
  const { data: canAccessSettings, isLoading: isLoadingCanAccessSettings } =
    useGetIsCompanyProfileAdminQuery();
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();

  const reporteeName = formatDisplayName({
    fullName: reportee?.name || '',
    type: reportee?.type === 'Organization' ? 'company' : 'person',
  });

  useEffect(() => {
    // Remove the openAccountMenu query parameter after reading it the first time
    if (searchParams.has('openAccountMenu')) {
      setShouldOpenAccountMenu(true);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openAccountMenu');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const isLoading =
    isLoadingReportee ||
    isLoadingIsAdmin ||
    isLoadingIsClientAdmin ||
    isLoadingCanAccessSettings ||
    currentUserIsLoading;

  const getMenuItems = (): MenuItemProps[] => {
    const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;
    const displayConsentGui = window.featureFlags?.displayConsentGui;
    const displayPoaOverviewPage = window.featureFlags?.displayPoaOverviewPage;

    if (isLoading) {
      const loadingMenuItem: MenuItemProps = {
        icon: {
          name: 'xxxxx xxxxxxxxx',
          type: 'person',
        },
        title: 'xxxxxxxxxxxxxxx',
        description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        href: '',
        loading: true,
      };
      return [loadingMenuItem, loadingMenuItem, loadingMenuItem, loadingMenuItem];
    }

    const items: MenuItemProps[] = [];
    if (displayConfettiPackage) {
      items.push({
        ...getUsersMenuItem(),
        description:
          reportee?.type === 'Organization'
            ? t('landing_page.users_item_description_org')
            : t('landing_page.users_item_description_person'),
      });
    }

    if (displayPoaOverviewPage && isAdmin) {
      items.push({
        ...getPoaOverviewMenuItem(),
        description: t('landing_page.poa_item_description'),
      });
    }

    if (displayConfettiPackage && isAdmin) {
      items.push({
        ...getReporteesMenuItem(),
        description:
          reportee?.type === 'Organization'
            ? t('landing_page.reportees_item_description_org')
            : t('landing_page.reportees_item_description_person'),
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
      hasSystemUserClientAdminPermission(reportee, isClientAdmin)
    ) {
      items.push({
        ...getSystemUserMenuItem(),
        description: t('landing_page.systemuser_item_description'),
      });
    }
    return items;
  };

  const getRequestCountText = (
    reportee: ReporteeInfo | undefined,
    requestCount: number,
  ): string => {
    const name =
      reportee?.partyUuid === currentUser?.partyUuid ? t('common.you_uppercase') : reporteeName;
    const countText = requestCount === 0 ? t('common.none') : requestCount;
    const requestTextKey =
      requestCount === 1 ? 'landing_page.new_requests_single' : 'landing_page.new_requests_plural';

    return t(requestTextKey, {
      reportee: name,
      requestCount: countText,
    });
  };

  const getOtherItems = (): MenuItemProps[] => {
    const displaySettingsPage = window.featureFlags?.displaySettingsPage;
    const displayRequestsPage = window.featureFlags?.displayRequestsPage;
    const requestCount = 0;
    const items: MenuItemProps[] = [];

    if (displayRequestsPage) {
      items.push({
        ...getRequestsMenuItem(),
        title: getRequestCountText(reportee, requestCount),
        loading: isLoading,
      });
    }

    if (canAccessSettings && displaySettingsPage) {
      items.push({ ...getSettingsMenuItem(), loading: isLoading });
    }

    return items;
  };

  const isSubunit =
    (reportee?.unitType === 'BEDR' || reportee?.unitType === 'AAFY') &&
    reportee?.type === 'Organization';

  const getReporteeDescription = (): string => {
    if (reportee?.type === 'Organization') {
      const orgNrString = `${t('common.org_nr')} ${reportee?.organizationNumber?.match(/.{1,3}/g)?.join(' ') || ''}`;
      if (isSubunit) {
        return `↳ ${orgNrString}, ${t('common.subunit').toLowerCase()}`;
      }
      return orgNrString;
    }
    return `${t('common.date_of_birth')} ${formatDateToNorwegian(reportee?.dateOfBirth)}`;
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper openAccountMenu={shouldOpenAccountMenu}>
        <div className={classes.landingPage}>
          <ListItem
            icon={{
              isParent: !isSubunit,
              type: reportee?.type === 'Organization' ? 'company' : 'person',
              name: reporteeName,
            }}
            title={reporteeName}
            description={getReporteeDescription()}
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
                <ArrowRightIcon className={classes.arrowIcon} />
              </Link>
            </DsLink>
          </DsAlert>
          <ListItemContainer
            heading={t('landing_page.shortcut_links_heading')}
            items={getMenuItems()}
          />
          {getOtherItems().length > 0 && (
            <ListItemContainer
              heading={t('landing_page.other_links_heading')}
              items={getOtherItems()}
            />
          )}
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
