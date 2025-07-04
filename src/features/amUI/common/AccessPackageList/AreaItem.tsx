import { AccessAreaListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import type { ExtendedAccessArea } from './useAreaPackageList';

interface AreaItemProps {
  area: ExtendedAccessArea;
  expanded: boolean;
  toggleExpandedArea: (areaId: string) => void;
  children?: React.ReactNode;
  showBadge?: boolean;
}

export const AreaItem = ({
  area,
  expanded,
  toggleExpandedArea,
  children,
  showBadge,
}: AreaItemProps) => {
  const { t } = useTranslation();
  const isSm = useIsMobileOrSmaller();

  const getUniqueIdCount = (packages: AccessPackage[]) =>
    new Set(packages.map((pkg) => pkg.id)).size;

  const uniqueDelegatedCount = getUniqueIdCount(area.packages.assigned);
  const totalUniqueCount = getUniqueIdCount([
    ...area.packages.assigned,
    ...area.packages.available,
  ]);

  const badgeText =
    !isSm && showBadge
      ? t('access_packages.delegated_packages_count_badge', {
          delegated: uniqueDelegatedCount,
          total: totalUniqueCount,
        })
      : undefined;

  return (
    <AccessAreaListItem
      key={area.id}
      id={area.id}
      name={area.name}
      colorTheme='company'
      iconUrl={area.iconUrl}
      badgeText={badgeText}
      expanded={expanded}
      titleAs='h3'
      onClick={() => toggleExpandedArea(area.id)}
    >
      {children}
    </AccessAreaListItem>
  );
};
