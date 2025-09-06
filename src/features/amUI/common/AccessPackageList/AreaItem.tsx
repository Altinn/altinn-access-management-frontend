import { AccessAreaListItem, Badge, BadgeProps } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import type { ExtendedAccessArea } from './useAreaPackageList';
import { PermissionBadge } from './PermissionBadge';
import { isCriticalAndUndelegated, UndelegatedPackageWarning } from './UndelegatedPackageWarning';

interface AreaItemProps {
  area: ExtendedAccessArea;
  expanded: boolean;
  toggleExpandedArea: (areaId: string) => void;
  children?: React.ReactNode;
  showPackagesCount?: boolean;
  showPermissions?: boolean;
}

export const AreaItem = ({
  area,
  expanded,
  toggleExpandedArea,
  children,
  showPackagesCount,
  showPermissions,
}: AreaItemProps) => {
  const { t } = useTranslation();
  const isSm = useIsMobileOrSmaller();

  const permissions = area.packages.assigned
    .flatMap((pkg) => pkg.permissions)
    .filter((p) => p !== undefined);

  const showPackagesCountBadge = !isSm && showPackagesCount;
  const showPermissionsBadge = showPermissions;
  const showUndelegatedPackageWarning =
    showPermissions && area.packages.available.some((pkg) => isCriticalAndUndelegated(pkg));

  return (
    <AccessAreaListItem
      key={area.id}
      id={area.id}
      name={area.name}
      colorTheme='company'
      iconUrl={area.iconUrl}
      badge={
        showPackagesCountBadge || showPermissionsBadge || showUndelegatedPackageWarning ? (
          <>
            {showPackagesCountBadge && (
              <Badge
                label={t('access_packages.delegated_packages_count_badge', {
                  delegated: area.packages.assigned.length,
                  total: area.packages.assigned.length + area.packages.available.length,
                })}
                color='company'
              />
            )}
            {showPermissionsBadge && <PermissionBadge permissions={permissions} />}
            {showUndelegatedPackageWarning && <UndelegatedPackageWarning />}
          </>
        ) : undefined
      }
      expanded={expanded}
      titleAs='h3'
      onClick={() => toggleExpandedArea(area.id)}
      size='lg'
      border='solid'
    >
      {children}
    </AccessAreaListItem>
  );
};
