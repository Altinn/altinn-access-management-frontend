import React, { ComponentPropsWithoutRef } from 'react';
import { Breadcrumbs as AcBreadcrumbs, DsSkeleton } from '@altinn/altinn-components';
import { Link, matchPath, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';

export type BreadcrumbItem = { label?: string; href?: string };

const root = { label: 'sidebar.access_management', href: '/' };
const systemUserOverview = {
  href: `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
  label: 'sidebar.systemaccess',
};
const systemUserCreate = {
  href: `/${SystemUserPath.SystemUser}/${SystemUserPath.Create}`,
  label: 'systemuser_overviewpage.new_system_user_button',
};
const users = {
  href: `/${amUIPath.Users}`,
  label: 'sidebar.users',
};
const reportees = {
  href: `/${amUIPath.Reportees}`,
  label: 'sidebar.reportees',
};
const poaOverview = {
  href: `/${amUIPath.PoaOverview}`,
  label: 'sidebar.poa_overview',
};
const consent = {
  href: `/${ConsentPath.Consent}/${ConsentPath.Active}`,
  label: 'sidebar.consent',
};
const consentLog = {
  href: `/${ConsentPath.Consent}/${ConsentPath.Log}`,
  label: 'consent_log.heading',
};
const settings = {
  href: `/${amUIPath.Settings}`,
  label: 'sidebar.settings',
};
const requests = {
  href: `/${amUIPath.Requests}`,
  label: 'sidebar.requests',
};

type RouteConfig = {
  pattern: string;
  breadcrumbs: (lastElement: BreadcrumbItem) => BreadcrumbItem[];
};

const routeMap: RouteConfig[] = [
  {
    pattern: `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
    breadcrumbs: () => [root, systemUserOverview],
  },
  {
    pattern: `/${SystemUserPath.SystemUser}/${SystemUserPath.Create}`,
    breadcrumbs: () => [root, systemUserOverview, systemUserCreate],
  },
  {
    pattern: `/${SystemUserPath.SystemUser}/${SystemUserPath.Details}`,
    breadcrumbs: (lastElement) => [root, systemUserOverview, lastElement],
  },
  {
    pattern: `/${SystemUserPath.SystemUser}/${SystemUserPath.AgentDelegation}`,
    breadcrumbs: (lastElement) => [root, systemUserOverview, lastElement],
  },
  {
    pattern: `/${amUIPath.Users}`,
    breadcrumbs: () => [root, users],
  },
  {
    pattern: `/${amUIPath.UserRights}`,
    breadcrumbs: (lastElement) => [root, users, lastElement],
  },
  {
    pattern: `/${amUIPath.Reportees}`,
    breadcrumbs: () => [root, reportees],
  },
  {
    pattern: `/${amUIPath.ReporteeRights}`,
    breadcrumbs: (lastElement) => [root, reportees, lastElement],
  },
  {
    pattern: `/${amUIPath.PoaOverview}`,
    breadcrumbs: () => [root, poaOverview],
  },
  {
    pattern: `/${amUIPath.PackagePoaDetails}`,
    breadcrumbs: (lastElement) => [root, poaOverview, lastElement],
  },
  {
    pattern: `/${ConsentPath.Consent}/${ConsentPath.Active}`,
    breadcrumbs: () => [root, consent],
  },
  {
    pattern: `/${ConsentPath.Consent}/${ConsentPath.Log}`,
    breadcrumbs: () => [root, consent, consentLog],
  },
  {
    pattern: `/${amUIPath.Settings}`,
    breadcrumbs: () => [root, settings],
  },
  {
    pattern: `/${amUIPath.Requests}`,
    breadcrumbs: () => [root, requests],
  },
];

const calculateBreadcrumbsFromRoute = (path: string, lastName?: string) => {
  const lastElement = { label: lastName };

  const route = routeMap.find((route) => matchPath(route.pattern, path));
  return route?.breadcrumbs(lastElement) ?? [];
};

interface BreadcrumbsProps {
  lastBreadcrumbLabel?: string;
  case?: 'systemuser' | 'agentsystemuser' | 'toparty' | 'fromparty' | 'accesspackage';
}

export const Breadcrumbs = ({ lastBreadcrumbLabel }: BreadcrumbsProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const items = calculateBreadcrumbsFromRoute(pathname, lastBreadcrumbLabel);

  const breadcrumbItems = items.map((item) => {
    const to = 'href' in item ? item.href : '';
    return {
      label: item.label ? t(item.label) : <DsSkeleton variant='text'>xxxxxxxxxxxxxx</DsSkeleton>,
      as: (props: ComponentPropsWithoutRef<typeof Link>) => (
        <Link
          {...props}
          to={to ?? ''}
        />
      ),
    };
  });

  return items.length > 0 ? <AcBreadcrumbs items={breadcrumbItems} /> : <></>;
};
