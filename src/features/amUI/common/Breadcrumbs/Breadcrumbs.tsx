import React, { ComponentPropsWithoutRef } from 'react';
import { Breadcrumbs as AcBreadcrumbs, DsSkeleton } from '@altinn/altinn-components';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { amUIPath, ConsentPath, SystemUserPath } from '@/routes/paths';

export type BreadcrumbItem = { label?: string; href?: string };

const BreadcrumbConfig = {
  root: { label: 'sidebar.access_management', href: '/' },
  systemuser_overview: {
    href: `/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
    label: 'sidebar.systemaccess',
  },
  systemuser_create: {
    href: `/${SystemUserPath.SystemUser}/${SystemUserPath.Create}`,
    label: 'systemuser_overviewpage.new_system_user_button',
  },
  users: {
    href: `/${amUIPath.Users}`,
    label: 'sidebar.users',
  },
  reportees: {
    href: `/${amUIPath.Reportees}`,
    label: 'sidebar.reportees',
  },
  poa_overview: {
    href: `/${amUIPath.PoaOverview}`,
    label: 'sidebar.poa_overview',
  },
  consent: {
    href: `/${ConsentPath.Consent}/${ConsentPath.Active}`,
    label: 'sidebar.consent',
  },
  consent_log: {
    href: `/${ConsentPath.Consent}/${ConsentPath.Log}`,
    label: 'consent_log.heading',
  },
  settings: {
    href: `/${amUIPath.Settings}`,
    label: 'sidebar.settings',
  },
  requests: {
    href: `/${amUIPath.Requests}`,
    label: 'sidebar.requests',
  },
};

interface BreadcrumbsProps {
  items: (keyof typeof BreadcrumbConfig)[];
  lastBreadcrumb?: { label?: string };
}

export const Breadcrumbs = ({ items, lastBreadcrumb }: BreadcrumbsProps) => {
  const { t } = useTranslation();

  const last = lastBreadcrumb ? [lastBreadcrumb] : [];
  const breadcrumbs: BreadcrumbItem[] = [...items.map((item) => BreadcrumbConfig[item]), ...last];
  const breadcrumbItems = breadcrumbs.map((item) => {
    return {
      label: item.label ? t(item.label) : <DsSkeleton variant='text'>xxxxxxxxxxxxxx</DsSkeleton>,
      as: (props: ComponentPropsWithoutRef<typeof Link>) => (
        <Link
          {...props}
          to={item.href ?? ''}
        />
      ),
    };
  });

  return items.length > 0 ? <AcBreadcrumbs items={breadcrumbItems} /> : null;
};
