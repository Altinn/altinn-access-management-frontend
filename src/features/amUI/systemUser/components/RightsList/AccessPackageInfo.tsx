import React, { useState } from 'react';
import { ResourceList } from '@altinn/altinn-components';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { ArrowLeftIcon, PackageIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { getButtonIconSize } from '@/resources/utils';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { ResourceDetails } from './ResourceDetails';

interface AccessPackageInfoProps {
  accessPackage: SystemUserAccessPackage;
}
export const AccessPackageInfo = ({
  accessPackage,
}: AccessPackageInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);

  const navigateToFirstStep = (): void => {
    setSelectedResource(null);
  };

  return (
    <div className={classes.accessPackages}>
      {selectedResource ? (
        <>
          <div>
            <Button
              variant='tertiary'
              color='neutral'
              data-size='sm'
              onClick={navigateToFirstStep}
              icon
            >
              <ArrowLeftIcon fontSize={getButtonIconSize(true)} />
              {t('common.back')}
            </Button>
          </div>
          <ResourceDetails resource={selectedResource} />
        </>
      ) : (
        <>
          <div className={classes.resourceInfoHeader}>
            <PackageIcon fontSize={28} />
            <div>
              <Heading
                level={1}
                data-size='xs'
              >
                {accessPackage.name}
              </Heading>
            </div>
          </div>
          <Paragraph data-size='sm'>{accessPackage.description}</Paragraph>
          <div>
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
          </div>
          <ResourceList
            defaultItemSize='sm'
            items={accessPackage.resources.map((resource) => {
              return {
                id: resource.identifier,
                ownerLogoUrl: resource.resourceOwnerLogoUrl,
                ownerLogoUrlAlt: resource.resourceOwnerName,
                ownerName: resource.resourceOwnerName,
                resourceName: resource.title,
                onClick: () => setSelectedResource(resource),
              };
            })}
          />
        </>
      )}
    </div>
  );
};
