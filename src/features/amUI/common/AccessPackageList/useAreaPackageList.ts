import { useMemo } from 'react';

import type {
  AccessArea,
  AccessPackage,
  AccessPackageDelegation,
} from '@/rtk/features/accessPackageApi';

export interface ExtendedAccessArea extends AccessArea {
  packages: {
    assigned: AccessPackage[];
    available: AccessPackage[];
  };
}

interface useAreaPackagesProps {
  allPackageAreas?: AccessArea[];
  activeDelegations?: { [key: string]: AccessPackageDelegation[] };
  showAllAreas?: boolean;
  showAllPackages?: boolean;
}

export const useAreaPackageList = ({
  allPackageAreas,
  activeDelegations,
  showAllAreas,
  showAllPackages,
}: useAreaPackagesProps) => {
  const accessAreas = useMemo(() => {
    if (!allPackageAreas || !activeDelegations) {
      return {
        assignedAreas: [],
        availableAreas: [],
      };
    }

    return allPackageAreas.reduce(
      (acc, area) => {
        const activeDelegationArea: AccessPackageDelegation[] | null = activeDelegations
          ? activeDelegations[area.id]
          : null;

        if (activeDelegationArea) {
          const pkgs = area.accessPackages.reduce(
            (pkgAcc, pkg) => {
              const hasAccess = activeDelegationArea.some((d) => d.accessPackageId === pkg.id);

              if (hasAccess) {
                pkgAcc.assigned.push(pkg);
              } else if (showAllPackages) {
                pkgAcc.available.push(pkg);
              }

              return pkgAcc;
            },
            {
              assigned: [] as AccessPackage[],
              available: [] as AccessPackage[],
            },
          );

          acc.assignedAreas.push({ ...area, packages: pkgs });
        } else if (showAllAreas) {
          acc.availableAreas.push({
            ...area,
            packages: showAllPackages
              ? { assigned: [], available: area.accessPackages }
              : { assigned: [], available: [] },
          });
        }
        return acc;
      },
      {
        assignedAreas: [] as ExtendedAccessArea[],
        availableAreas: [] as ExtendedAccessArea[],
      },
    );
  }, [allPackageAreas, activeDelegations, showAllAreas, showAllPackages]);

  return accessAreas;
};
