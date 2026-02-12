import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';

export const GuardianshipPermissions = () => {
  const { t } = useTranslation();

  const [debouncedSearchString, setDebouncedSearchString] = useState<string>('');

  return (
    <>
      <DebouncedSearchField
        placeholder={t('guardianships.search_label')}
        setDebouncedSearchString={setDebouncedSearchString}
      />

      <AccessPackageList
        searchString={debouncedSearchString}
        minimizeAvailablePackages={false}
        showAvailableToggle={false}
        showPermissions
        showAllPackages={true}
        showAllAreas={true}
        showOnlyGuardianships
        showPackagesCount={false}
        packageAs={(props) => {
          const { packageId, ...rest } = props;
          return (
            <Link
              to={`/poa-overview/access-package/${packageId}`}
              {...rest}
            />
          );
        }}
        noPackagesText={t('access_packages.no_packages')}
      />
    </>
  );
};
