import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { Link } from 'react-router';
import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';
import { DsParagraph } from '@altinn/altinn-components';
import classes from './AccessPackagePermissions.module.css';
import { AccessPackageInfoPopover } from '../common/AccessPackageInfoPopover/AccessPackageInfoPopover';

export const AccessPackagePermissions = () => {
  const { t } = useTranslation();

  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  return (
    <>
      <div className={classes.description}>
        <DsParagraph asChild>
          <div>
            {t('poa_overview_page.packages_tab.description')}
            <span className={classes.infoPopover}>
              <AccessPackageInfoPopover />
            </span>
          </div>
        </DsParagraph>
      </div>
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
        packageAs={(props) => {
          const { packageId, ...rest } = props;
          return (
            <Link
              to={`/poa-overview/access-package/${packageId}?parentTab=packages`}
              {...rest}
            />
          );
        }}
        noPackagesText={t('access_packages.no_packages')}
        areaHeadingLevel={2}
      />
    </>
  );
};
