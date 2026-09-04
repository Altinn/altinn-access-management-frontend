import { AccessAreaListItem, Badge } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import type { ExtendedAccessArea } from './useAreaPackageList';
import { isCriticalAndUndelegated, UndelegatedPackageWarning } from './UndelegatedPackageWarning';
import { PartyType } from '@/rtk/features/userInfoApi';
import { usePackagePermissionOverview } from './usePackagePermissionOverview';
import { PermissionsBadge } from '../PermissionsBadge/PermissionsBadge';

interface AreaItemProps {
  area: ExtendedAccessArea;
  expanded: boolean;
  toggleExpandedArea: (areaId: string) => void;
  children?: React.ReactNode;
  showPackagesCount?: boolean;
  showPermissions?: boolean;
  partyType: PartyType;
  headingLevel?: 2 | 3 | 4;
}

export const AreaItem = ({
  area,
  expanded,
  toggleExpandedArea,
  children,
  showPackagesCount,
  showPermissions,
  partyType,
  headingLevel = 3,
}: AreaItemProps) => {
  const { t } = useTranslation();
  const isSm = useIsMobileOrSmaller();

  const permissions = useMemo(
    () => area.packages.assigned.flatMap((pkg) => pkg.permissions).filter((p) => p !== undefined),
    [area.packages.assigned],
  );

  const { permissionsOverview } = usePackagePermissionOverview({ permissions });

  const showPackagesCountBadge = !isSm && showPackagesCount;
  const showPermissionsBadge = showPermissions;
  const showUndelegatedPackageWarning =
    showPermissions && area.packages.available.some((pkg) => isCriticalAndUndelegated(pkg));
  const colorTheme = partyType === PartyType.Person ? 'person' : 'company';

  return (
    <AccessAreaListItem
      key={area.id}
      id={area.id}
      name={area.name}
      colorTheme={colorTheme}
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
                color={colorTheme}
              />
            )}
            {showPermissionsBadge && <PermissionsBadge permissions={permissionsOverview} />}
            {showUndelegatedPackageWarning && <UndelegatedPackageWarning />}
          </>
        ) : undefined
      }
      expanded={expanded}
      titleAs={`h${headingLevel}` as 'h2' | 'h3' | 'h4'}
      onClick={() => toggleExpandedArea(area.id)}
      size='lg'
      border='solid'
    >
      {children}
    </AccessAreaListItem>
  );
};
