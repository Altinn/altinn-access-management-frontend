import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { Link } from 'react-router';
import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';

export const AccessPackagePermissions = () => {
  const { t } = useTranslation();

  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  return (
    <>
      <DebouncedSearchField
        placeholder={t('access_packages.search_label')}
        setDebouncedSearchString={setDebouncedSearchString}
      />
      <AccessPackageList
        searchString={debouncedSearchString}
        minimizeAvailablePackages={false}
        showAvailableToggle={false}
        showPermissions
        showAllPackages
        showAllAreas
        showPackagesCount={false}
        packageAs={(props) => (
          <Link
            to={`/poa-overview/access-package/${props.packageId}`}
            {...props}
          />
        )}
        noPackagesText={t('access_packages.no_packages')}
      />
    </>
  );
};
