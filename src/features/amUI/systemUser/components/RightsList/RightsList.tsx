import React from 'react';
import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { AccessPackageInfo } from './AccessPackageInfo';
import { ResourceInfo } from './ResourceInfo';

interface RightsListProps {
  resources: ServiceResource[];
  accessPackages: SystemUserAccessPackage[];
}

export const RightsList = ({ resources, accessPackages }: RightsListProps): React.ReactNode => {
  const { t } = useTranslation();
  return (
    <div className={classes.rightsList}>
      {accessPackages.length > 0 && (
        <div>
          <Heading
            data-size='2xs'
            level={2}
          >
            {accessPackages.length === 1
              ? t('systemuser_detailpage.right_accesspackage_singular')
              : t('systemuser_detailpage.right_accesspackage_plural', {
                  accessPackageCount: accessPackages.length,
                })}
          </Heading>
          <ul className={classes.unstyledList}>
            {accessPackages.map((accessPackage) => (
              <AccessPackageInfo
                key={accessPackage.id}
                accessPackage={accessPackage}
              />
            ))}
          </ul>
        </div>
      )}
      {resources.length > 0 && (
        <div>
          <Heading
            data-size='2xs'
            level={2}
          >
            {resources.length === 1
              ? t('systemuser_detailpage.right_resource_singular')
              : t('systemuser_detailpage.right_resource_plural', {
                  resourcesCount: resources.length,
                })}
          </Heading>
          <ul className={classes.unstyledList}>
            {resources.map((resource) => (
              <ResourceInfo
                key={resource.identifier}
                resource={resource}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
