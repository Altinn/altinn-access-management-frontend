import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useSearchQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';

export const useAccessPackageLookup = () => {
  const { i18n } = useTranslation();

  const {
    data: accessAreas,
    isLoading,
    isFetching,
    error,
  } = useSearchQuery({
    searchString: '',
    language: i18n.language,
    typeName: '',
  });

  const packageMap = React.useMemo(() => {
    const map = new Map<string, AccessPackage>();
    if (!accessAreas) {
      return map;
    }

    accessAreas.forEach((area) => {
      area.accessPackages.forEach((pkg) => {
        map.set(pkg.id, pkg);
      });
    });

    return map;
  }, [accessAreas]);

  const getAccessPackageById = React.useCallback(
    (packageId?: string | null): AccessPackage | undefined => {
      if (!packageId) {
        return undefined;
      }

      return packageMap.get(packageId);
    },
    [packageMap],
  );

  return { getAccessPackageById, isLoading, isFetching, error } as const;
};
