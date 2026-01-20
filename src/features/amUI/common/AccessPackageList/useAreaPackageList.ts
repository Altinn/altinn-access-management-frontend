import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import {
  useGetUserDelegationsQuery,
  useSearchQuery,
  type AccessArea,
  type AccessPackage,
  type AccessPackageDelegation,
} from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { getInheritedStatus, type InheritedStatusMessageType } from '../useInheritedStatus';
import { PartyType } from '@/rtk/features/userInfoApi';

export interface ExtendedAccessArea extends AccessArea {
  packages: {
    assigned: ExtendedAccessPackage[];
    available: ExtendedAccessPackage[];
  };
}

export interface ExtendedAccessPackage extends AccessPackage {
  deletableStatus?: DeletableStatus;
  inherited?: boolean;
  inheritedStatus?: InheritedStatusMessageType;
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
  const { i18n } = useTranslation();
  const { fromParty, toParty, actingParty } = usePartyRepresentation();
  const typeName = actingParty
    ? actingParty.partyTypeName === PartyType.Organization
      ? 'organisasjon'
      : 'person'
    : undefined;

  const {
    data: allPackageAreas,
    isLoading: loadingPackageAreas,
    isFetching: fetchingSearch,
    error: searchError,
  } = useSearchQuery(
    {
      searchString: searchString ?? '',
      language: i18n.language,
      typeName,
    },
    {
      skip: !actingParty,
    },
  );

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
                const inheritedStatus = getInheritedStatus({
                  permissions: pkgAccess.permissions,
                  actingParty,
                  toParty,
                  fromParty,
                });
                const acquiredPkg = {
                  ...pkg,
                  deletableStatus,
                  inherited:
                    !!inheritedStatus || deletableStatus !== DeletableStatus.FullyDeletable,
                  inheritedStatus,
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
  }, [
    actingParty,
    allPackageAreas,
    activeDelegations,
    fromParty,
    showAllAreas,
    showAllPackages,
    toParty,
  ]);

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

/**
 * Determine whether a permission is "inherited".
 *
 * A permission is considered NOT inherited only when it is directly delegated from
 * the specified from-party to the specified to-party and the permission's role
 * code is "rettighetshaver". In all other cases the permission is treated as
 * inherited (for example when the delegation comes via another party or the
 * role code differs).
 * If the permission object is missing a role, the function
 * returns false (not inherited).
 *
 * @param p - the permission object
 * @param toPartyUuid - UUID of the to-party to compare against the permission's to.id
 * @param fromPartyUuid - UUID of the from-party to compare against the permission's from.id
 * @returns true if the permission is inherited, false if it is a direct "rettighetshaver" delegation
 */

export const isInherited = (p: Permissions, toPartyUuid: string, fromPartyUuid: string) =>
  !(
    toPartyUuid === p.to.id &&
    fromPartyUuid === p.from.id &&
    p.role &&
    p.role?.code === 'rettighetshaver'
  );

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
