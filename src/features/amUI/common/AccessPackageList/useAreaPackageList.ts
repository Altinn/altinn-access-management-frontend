import { useMemo } from 'react';

import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import {
  useGetUserDelegationsQuery,
  useSearchQuery,
  type AccessArea,
  type AccessPackage,
  type AccessPackageDelegation,
} from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

export interface ExtendedAccessArea extends AccessArea {
  packages: {
    assigned: ExtendedAccessPackage[];
    available: ExtendedAccessPackage[];
  };
}

export interface ExtendedAccessPackage extends AccessPackage {
  deletableStatus?: DeletableStatus;
  inherited?: boolean;
  permissions?: Permissions[];
}

interface useAreaPackagesProps {
  showAllAreas?: boolean;
  showAllPackages?: boolean;
  searchString?: string;
}

export enum DeletableStatus {
  NotDeletable = 'NotDeletable',
  PartiallyDeletable = 'PartiallyDeletable',
  FullyDeletable = 'FullyDeletable',
}

export const useAreaPackageList = ({
  searchString,
  showAllAreas,
  showAllPackages,
}: useAreaPackagesProps) => {
  const { fromParty, toParty, actingParty } = usePartyRepresentation();

  const {
    data: allPackageAreas,
    isLoading: loadingPackageAreas,
    isFetching: fetchingSearch,
    error: searchError,
  } = useSearchQuery(searchString ?? '');

  const {
    data: activeDelegations,
    isLoading: loadingDelegations,
    error: activeDelegationsError,
  } = useGetUserDelegationsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    {
      skip: (!toParty?.partyUuid && !fromParty?.partyUuid) || !actingParty?.partyUuid,
    },
  );

  const { assignedAreas, availableAreas } = useMemo(() => {
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
              const pkgAccess = activeDelegationArea.find((d) => d.package.id === pkg.id);
              if (pkgAccess !== undefined) {
                const deletableStatus = getDeletableStatus(
                  pkgAccess,
                  toParty?.partyUuid,
                  fromParty?.partyUuid,
                );
                const acquiredPkg = {
                  ...pkg,
                  deletableStatus,
                  inherited: deletableStatus !== DeletableStatus.FullyDeletable,
                  permissions: pkgAccess.permissions ?? [],
                };
                pkgAcc.assigned.push(acquiredPkg);
              } else if (showAllPackages) {
                pkgAcc.available.push(pkg);
              }

              return pkgAcc;
            },
            {
              assigned: [] as ExtendedAccessPackage[],
              available: [] as ExtendedAccessPackage[],
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

  return {
    loadingPackageAreas,
    fetchingSearch,
    loadingDelegations,
    assignedAreas,
    availableAreas,
    allPackageAreas,
    activeDelegations,
    searchError,
    activeDelegationsError,
  };
};

export const isInherited = (p: Permissions, toPartyUuid: string, fromPartyUuid: string) =>
  !(toPartyUuid === p.to.id && fromPartyUuid === p.from.id && p.role?.code === 'rettighetshaver');

export const getDeletableStatus = (
  pkg: AccessPackageDelegation,
  toPartyUuid?: string,
  fromPartyUuid?: string,
): DeletableStatus => {
  if (pkg.permissions.every((p) => isInherited(p, toPartyUuid || '', fromPartyUuid || ''))) {
    return DeletableStatus.NotDeletable;
  }
  if (pkg.permissions.some((p) => isInherited(p, toPartyUuid || '', fromPartyUuid || ''))) {
    return DeletableStatus.PartiallyDeletable;
  }

  return DeletableStatus.FullyDeletable;
};
