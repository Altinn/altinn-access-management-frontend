import React from 'react';
import { ResourceList } from '@altinn/altinn-components';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { PackageIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';

interface AccessPackageInfoProps {
  accessPackage: SystemUserAccessPackage;
  onSelectResource: (resource: ServiceResource) => void;
}
export const AccessPackageInfo = ({
  accessPackage,
  onSelectResource,
}: AccessPackageInfoProps): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={classes.accessPackages}>
      <div className={classes.resourceInfoHeader}>
        <PackageIcon fontSize={28} />
        <Heading
          level={1}
          data-size='xs'
        >
          {accessPackage.name}
        </Heading>
      </div>
      <Paragraph data-size='sm'>{accessPackage.description}</Paragraph>
      <Heading
        data-size='2xs'
        level={2}
      >
        {accessPackage.resources.length === 1
          ? t('systemuser_detailpage.accesspackage_resources_singular')
          : t('systemuser_detailpage.accesspackage_resources_plural', {
              resourcesCount: accessPackage.resources.length,
            })}
      </Heading>
      <ResourceList
        defaultItemSize='sm'
        items={accessPackage.resources.map((resource) => {
          return {
            id: resource.identifier,
            as: 'button',
            ownerLogoUrl: resource.resourceOwnerLogoUrl,
            ownerLogoUrlAlt: resource.resourceOwnerName,
            ownerName: resource.resourceOwnerName,
            resourceName: resource.title,
            onClick: () => onSelectResource(resource),
          };
        })}
      />
    </div>
  );
};
