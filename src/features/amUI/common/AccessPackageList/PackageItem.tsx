import { AccessPackageListItem, Typography } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { JSX } from 'react';

interface PackageItemProps {
  pkg: AccessPackage;
  onSelect?: (pkg: AccessPackage) => void;
  controls?: React.ReactNode;
  hasAccess?: boolean;
  badge?: React.ReactNode;
  as?: React.ElementType;
}

export const PackageItem = ({
  pkg,
  onSelect,
  controls,
  hasAccess,
  badge,
  as,
}: PackageItemProps) => {
  const { t } = useTranslation();

  return (
    <AccessPackageListItem
      id={pkg.id}
      name={pkg.name}
      titleAs='h4'
      description={t('access_packages.package_number_of_resources', {
        count: pkg.resources.length,
      })}
      onClick={() => onSelect?.(pkg)}
      controls={controls}
      color={hasAccess ? 'company' : 'neutral'}
      size='xs'
      badge={badge}
      as={as}
    />
  );
};
