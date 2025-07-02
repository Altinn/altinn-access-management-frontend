import { useMemo } from 'react';

import type {
  AccessArea,
  AccessPackage,
  AccessPackageDelegation,
} from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

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
  const { toParty, fromParty } = usePartyRepresentation();

  const accessAreas = useMemo(() => {
    if (!allPackageAreas || activeDelegations === undefined) {
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
              const pkgAccess = activeDelegationArea.filter((d) => d.package.id === pkg.id);
              if (pkgAccess.length > 0) {
                const inherited = pkgAccess.filter((access) =>
                  isInherited(access, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? ''),
                );
                if (inherited?.length > 0) {
                  pkgAcc.assigned.push({
                    ...pkg,
                    inherited: true,
                    permissions: inherited[0].permissions,
                  });
                }

                const delegated = pkgAccess.some(
                  (access) =>
                    !isInherited(access, toParty?.partyUuid ?? '', fromParty?.partyUuid ?? ''),
                );
                if (delegated) {
                  pkgAcc.assigned.push({ ...pkg, inherited: false });
                }
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
            packages: { assigned: [], available: area.accessPackages },
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

export const isInherited = (
  pkgDeleg: AccessPackageDelegation,
  toPartyUuid: string,
  fromPartyUuid: string,
) => {
  return pkgDeleg.permissions.some(
    (p) =>
      !(
        toPartyUuid === p.to.id &&
        fromPartyUuid === p.from.id &&
        p.role?.code === 'rettighetshaver'
      ),
  );
};
