import { AccessAreaListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedAccessArea } from './useAreaPackageList';
import { mobileBreakpoint } from '@/resources/utils/screensizeUtils';
import { useMediaQuery } from '@/resources/hooks';

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
  const isSm = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const badgeText =
    !isSm && showBadge
      ? t('access_packages.delegated_packages_count_badge', {
          delegated: area.packages.assigned.length,
          total: area.packages.assigned.length + area.packages.available.length,
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
      onClick={() => toggleExpandedArea(area.id)}
    >
      {children}
    </AccessAreaListItem>
  );
};
