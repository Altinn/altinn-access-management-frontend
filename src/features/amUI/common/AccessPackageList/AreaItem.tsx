import { ListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

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
  const badgeText =
    !isSm && showBadge
      ? t('access_packages.delegated_packages_count_badge', {
          delegated: area.packages.assigned.length,
          total: area.packages.assigned.length + area.packages.available.length,
        })
      : undefined;

  return (
    <ListItem
      key={area.id}
      id={area.id}
      title={{ children: area.name, as: 'h3' }}
      onClick={() => toggleExpandedArea(area.id)}
      icon={{ iconUrl: area.iconUrl }}
      color='company'
      badge={{ label: badgeText, color: 'company' }}
      expanded={expanded}
    >
      {children}
    </ListItem>
  );
};
