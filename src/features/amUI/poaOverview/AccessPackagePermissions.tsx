import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DsParagraph } from '@altinn/altinn-components';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { PackageSearchToolbar } from '../common/PackageSearchToolbar/PackageSearchToolbar';
import { AccessPackageInfoPopover } from '../common/AccessPackageInfoPopover/AccessPackageInfoPopover';

import classes from './AccessPackagePermissions.module.css';

export const AccessPackagePermissions = () => {
  const { t } = useTranslation();

  const [searchString, setSearchString] = useState('');
  const [serviceOwners, setServiceOwners] = useState<string[]>([]);

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
      <PackageSearchToolbar
        searchString={searchString}
        setSearchString={setSearchString}
        serviceOwners={serviceOwners}
        setServiceOwners={setServiceOwners}
      />
      <AccessPackageList
        searchString={searchString}
        serviceOwners={serviceOwners}
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
        firstHeadingLevel={2}
      />
    </>
  );
};
