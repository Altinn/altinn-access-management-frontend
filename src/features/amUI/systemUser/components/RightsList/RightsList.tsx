import React, { useRef, useState } from 'react';
import { ListItem, ResourceListItem } from '@altinn/altinn-components';
import { Button, Heading, Modal, Paragraph, Tabs } from '@digdir/designsystemet-react';
import { ArrowLeftIcon, PackageIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { getButtonIconSize } from '@/resources/utils';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { ResourceDetails } from './ResourceDetails';

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

interface ResourceInfoProps {
  resource: ServiceResource;
}
const ResourceInfo = ({ resource }: ResourceInfoProps): React.ReactNode => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const showResourceInfo = (): void => {
    modalRef.current?.showModal();
  };

  const closeModal = (): void => {
    modalRef.current?.close();
  };

  return (
    <li className={classes.resourceListItem}>
      <ResourceListItem
        id={resource.identifier}
        ownerName={resource.resourceOwnerName}
        resourceName={resource.title}
        ownerLogoUrl={resource.resourceOwnerLogoUrl}
        ownerLogoUrlAlt={resource.resourceOwnerName}
        size='md'
        onClick={showResourceInfo}
      />
      <Modal
        ref={modalRef}
        onClose={closeModal}
        backdropClose
      >
        <ResourceDetails resource={resource} />
      </Modal>
    </li>
  );
};

interface AccessPackageInfoProps {
  accessPackage: SystemUserAccessPackage;
}
const AccessPackageInfo = ({ accessPackage }: AccessPackageInfoProps): React.ReactElement => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);

  const showResourceInfo = (): void => {
    navigateToFirstStep();
    modalRef.current?.showModal();
  };

  const closeModal = (): void => {
    modalRef.current?.close();
  };

  const navigateToFirstStep = (): void => {
    setSelectedResource(null);
  };

  return (
    <li className={classes.resourceListItem}>
      <ListItem
        title={accessPackage.name}
        description={
          accessPackage.resources.length === 1
            ? t('systemuser_detailpage.accesspackage_resources_singular')
            : t('systemuser_detailpage.accesspackage_resources_plural', {
                resourcesCount: accessPackage.resources.length,
              })
        }
        icon='package'
        size='md'
        onClick={showResourceInfo}
      />
      <Modal
        ref={modalRef}
        onClose={closeModal}
        backdropClose
      >
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
              <div className={classes.servicesHeader}>
                <Tabs defaultValue='value1'>
                  <Tabs.List>
                    <Tabs.Tab value='value1'>
                      {accessPackage.resources.length === 1
                        ? t('systemuser_detailpage.accesspackage_resources_singular')
                        : t('systemuser_detailpage.accesspackage_resources_plural', {
                            resourcesCount: accessPackage.resources.length,
                          })}
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>
              </div>
              <ul className={classes.unstyledList}>
                {accessPackage.resources.map((resource) => (
                  <li
                    key={resource.identifier}
                    className={classes.resourceListItem}
                  >
                    <ResourceListItem
                      id={resource.identifier}
                      ownerName={resource.resourceOwnerName}
                      resourceName={resource.title}
                      ownerLogoUrl={resource.resourceOwnerLogoUrl}
                      ownerLogoUrlAlt={resource.resourceOwnerName}
                      size='sm'
                      onClick={() => setSelectedResource(resource)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Modal>
    </li>
  );
};
