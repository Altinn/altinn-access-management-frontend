import React, { ComponentPropsWithoutRef } from 'react';
import { Breadcrumbs as AcBreadcrumbs, DsSkeleton } from '@altinn/altinn-components';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from './BreadcrumbsContext';

export const Breadcrumbs = () => {
  const { items } = useBreadcrumbs();
  const { t } = useTranslation();

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
