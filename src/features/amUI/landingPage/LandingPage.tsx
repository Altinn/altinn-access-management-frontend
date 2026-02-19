import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import classes from './LandingPage.module.css';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDate,
  formatDisplayName,
  List,
  ListItem,
  MenuItemProps,
  UserListItem,
} from '@altinn/altinn-components';
import {
  ReporteeInfo,
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
  useGetReporteeQuery,
} from '@/rtk/features/userInfoApi';
import { useGetMyClientsQuery } from '@/rtk/features/clientApi';
import { useTranslation } from 'react-i18next';
import { LeaveIcon } from '@navikt/aksel-icons';
import { useSearchParams } from 'react-router';
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
  getClientAdministrationMenuItem,
  getSettingsMenuItem,
  getSystemUserMenuItem,
  getYourClientsMenuItem,
  getUsersMenuItem,
  getYourRightsMenuItem,
} from '@/resources/utils/sidebarConfig';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { formatOrgNr, isOrganization, isSubUnit } from '@/resources/utils/reporteeUtils';
import { getHostUrl } from '@/resources/utils/pathUtils';
import { useRequests } from '@/resources/hooks/useRequests';
import cn from 'classnames';
import { clientAdministrationPageEnabled } from '@/resources/utils/featureFlagUtils';

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
  const { pendingRequests, isLoadingRequests } = useRequests();
  const actingPartyUuid = getCookie('AltinnPartyUuid') ?? '';

  const reporteeName = formatDisplayName({
    fullName: reportee?.name || '',
    type: isOrganization(reportee) ? 'company' : 'person',
  });

  const isCurrentUserReportee = reportee?.partyUuid === currentUser?.partyUuid;
  const { data: myClientsByProvider } = useGetMyClientsQuery(
    { provider: [actingPartyUuid] },
    {
      skip:
        !actingPartyUuid ||
        !reportee?.partyUuid ||
        !currentUser?.partyUuid ||
        isCurrentUserReportee,
    },
  );
  const hasMyClients = myClientsByProvider && myClientsByProvider.length > 0;

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
    currentUserIsLoading ||
    isLoadingRequests;
  const displayClientAdministrationPage = clientAdministrationPageEnabled();

  const getMenuItems = (): MenuItemProps[] => {
    const displayConfettiPackage = window.featureFlags?.displayConfettiPackage;
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
        description: isOrganization(reportee)
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
        description: isOrganization(reportee)
          ? t('landing_page.reportees_item_description_org')
          : t('landing_page.reportees_item_description_person'),
      });
    }

    if (hasConsentPermission(isAdmin)) {
      items.push({
        ...getConsentMenuItem(),
        description: t('landing_page.consent_item_description'),
      });
    }
    if (isClientAdmin && displayClientAdministrationPage) {
      items.push({
        ...getClientAdministrationMenuItem(),
        description: t('landing_page.client_admin_item_description'),
      });
    }
    if (
      hasCreateSystemUserPermission(reportee, isAdmin) ||
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
    const requestCount = pendingRequests ? pendingRequests.length : 0;
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

  const getYourAccessesItems = () => {
    const items: MenuItemProps[] = [];
    items.push({
      ...getYourRightsMenuItem(currentUser?.partyUuid ?? '', '/', isLoading),
      description: isCurrentUserReportee
        ? t('landing_page.your_rights_description_yourself')
        : t('landing_page.your_rights_description', { reportee: reporteeName }),
    });

    if (!isCurrentUserReportee && hasMyClients && displayClientAdministrationPage) {
      items.push({
        ...getYourClientsMenuItem('/', isLoading),
        description: t('landing_page.your_clients_description', { reportee: reporteeName }),
      });
    }

    return items;
  };

  const isReporteeSubUnit = isSubUnit(reportee);

  const getReporteeDescription = (): string => {
    if (isOrganization(reportee) && reportee?.organizationNumber) {
      const orgNrString = `${t('common.org_nr')} ${formatOrgNr(reportee?.organizationNumber)}`;
      if (isReporteeSubUnit) {
        return `↳ ${orgNrString}, ${t('common.subunit').toLowerCase()}`;
      }
      return orgNrString;
    } else if (reportee?.dateOfBirth) {
      return `${t('common.date_of_birth')} ${formatDate(reportee?.dateOfBirth)}`;
    }
    return '';
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper openAccountMenu={shouldOpenAccountMenu}>
        <div className={classes.landingPage}>
          <DsHeading
            level={1}
            className={classes.landingPageHeading}
          >
            <UserListItem
              id={reportee?.partyUuid ?? ''}
              type={isOrganization(reportee) ? 'company' : 'person'}
              name={reporteeName}
              description={getReporteeDescription()}
              subUnit={isReporteeSubUnit}
              deleted={reportee?.isDeleted}
              size='lg'
              loading={!reportee}
              interactive={false}
              shadow='none'
            />
          </DsHeading>
          <DsAlert data-color='info'>
            {isLoading ? (
              <DsSkeleton
                variant='rectangle'
                height={150}
                width='100%'
              />
            ) : (
              <>
                <DsHeading
                  level={2}
                  data-size='xs'
                  color='info'
                >
                  {isOrganization(reportee)
                    ? t('landing_page.alert_heading')
                    : t('landing_page.alert_heading_priv')}
                </DsHeading>
                <div className={classes.landingPageAlert}>
                  <DsParagraph>
                    {isOrganization(reportee)
                      ? t('landing_page.alert_body')
                      : t('landing_page.alert_body_priv')}
                  </DsParagraph>
                  <DsParagraph>
                    {isOrganization(reportee)
                      ? t('landing_page.alert_body_p2')
                      : t('landing_page.alert_body_p2_priv')}
                  </DsParagraph>
                  <DsButton
                    asChild
                    variant='secondary'
                  >
                    <a href={`${getHostUrl()}ui/profile`}>
                      <LeaveIcon />
                      {t('landing_page.alert_link')}
                    </a>
                  </DsButton>
                </div>
              </>
            )}
          </DsAlert>
          <ListItemContainer
            heading={t('landing_page.your_content_heading')}
            items={getYourAccessesItems()}
            renderAsCards
          />
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
  renderAsCards?: boolean;
}
const ListItemContainer = ({ heading, items, renderAsCards = false }: ListItemContainerProps) => {
  return (
    <div>
      <DsHeading
        level={2}
        data-size='xs'
      >
        {heading}
      </DsHeading>
      <List className={cn(classes.listItemContainer, !renderAsCards && classes.menuList)}>
        {items.map((item, index) => (
          <ListItem
            className={cn(renderAsCards && classes.cardItem)}
            key={`${item.href}-${index}`}
            icon={item.icon}
            title={item.title}
            description={item.description}
            badge={item.badge}
            size={'xs'}
            border='none'
            shadow={'none'}
            linkIcon
            loading={item.loading}
            as={item.as}
          />
        ))}
      </List>
    </div>
  );
};
