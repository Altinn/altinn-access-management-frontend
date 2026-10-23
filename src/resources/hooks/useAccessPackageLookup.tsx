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
        if (pkg.urn) {
          map.set(pkg.urn, pkg);
        }
      });
    });

    return map;
  }, [accessAreas]);

  const getAccessPackageByUrn = React.useCallback(
    (packageUrn?: string | null): AccessPackage | undefined => {
      if (!packageUrn) {
        return undefined;
      }

      return packageMap.get(packageUrn);
    },
    [packageMap],
  );

  return { getAccessPackageByUrn, isLoading, isFetching, error } as const;
};
