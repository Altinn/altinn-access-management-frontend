import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router';

export type BreadcrumbItem = { label?: string; href?: string };

// Internal full context (Breadcrumbs consumes all)
type BreadcrumbsContextValue = {
  items: BreadcrumbItem[];
  setLastBreadcrumbLabel: (name?: string) => void;
};

const root = { label: 'sidebar.access_management', href: '/' };
const systemUserOverview = {
  href: `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
  label: 'sidebar.systemaccess',
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
    pattern: '/',
    breadcrumbs: () => [],
  },
  {
    pattern: `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
    breadcrumbs: () => [root, systemUserOverview],
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

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | undefined>(undefined);

const calculateBreadcrumbsFromRoute = (path: string, lastName?: string) => {
  const lastElement = { label: lastName };

  const route = routeMap.find((route) => matchPath(route.pattern, path));
  return route?.breadcrumbs(lastElement) ?? [];
};

export interface BreadcrumbsProps {
  items: { label?: string; href?: string }[];
}

export const BreadcrumbsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const [lastItemLabel, setLastItemLabel] = useState<string | undefined>('');

  const setLastBreadcrumbLabel = useCallback((name?: string) => {
    setLastItemLabel(name);
  }, []);

  useEffect(() => {
    setItems(calculateBreadcrumbsFromRoute(pathname, lastItemLabel));
  }, [pathname, lastItemLabel]);

  return (
    <BreadcrumbsContext.Provider value={{ items, setLastBreadcrumbLabel }}>
      {children}
    </BreadcrumbsContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx) throw new Error('useBreadcrumbs must be used within BreadcrumbsProvider');
  return ctx;
};
