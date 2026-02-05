import { AccessPackageListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { PartyType } from '@/rtk/features/userInfoApi';

interface PackageItemProps {
  pkg: AccessPackage;
  onSelect?: (pkg: AccessPackage) => void;
  controls?: React.ReactNode;
  hasAccess?: boolean;
  badge?: React.ReactNode;
  as?: React.ElementType;
  partyType: PartyType;
}

export const PackageItem = ({
  pkg,
  onSelect,
  controls,
  hasAccess,
  badge,
  as,
  partyType,
}: PackageItemProps) => {
  const { t } = useTranslation();
  const partyTypeColor = partyType === PartyType.Person ? 'person' : 'company';

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
      color={hasAccess ? partyTypeColor : 'neutral'}
      size='xs'
      badge={badge}
      as={as}
    />
  );
};
