import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageList,
  DsButton,
  DsDialog,
  DsHeading,
  ResourceList,
} from '@altinn/altinn-components';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { AccessPackageInfo } from './AccessPackageInfo';
import { ResourceDetails } from './ResourceDetails';

import { getButtonIconSize } from '@/resources/utils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface RightsListProps {
  resources: ServiceResource[];
  accessPackages: SystemUserAccessPackage[];
  hideHeadings?: boolean;
}

export const RightsList = ({
  resources,
  accessPackages,
  hideHeadings,
}: RightsListProps): React.ReactNode => {
  const { t } = useTranslation();
  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);
  const [selectedAccessPackage, setSelectedAccessPackage] =
    React.useState<SystemUserAccessPackage | null>(null);

  const onSelectResource = (resource: ServiceResource): void => {
    setSelectedResource(resource);
    modalRef.current?.showModal();
  };

  const onSelectAccessPackage = (accessPackage: SystemUserAccessPackage): void => {
    setSelectedAccessPackage(accessPackage);
    modalRef.current?.showModal();
  };

  const closeModal = (): void => {
    setSelectedResource(null);
    setSelectedAccessPackage(null);
    modalRef.current?.close();
  };

  return (
    <div className={classes.rightsList}>
      {accessPackages.length > 0 && (
        <div>
          {!hideHeadings && (
            <DsHeading
              data-size='2xs'
              level={2}
              className={classes.rightHeading}
            >
              {accessPackages.length === 1
                ? t('systemuser_detailpage.right_accesspackage_singular')
                : t('systemuser_detailpage.right_accesspackage_plural', {
                    accessPackageCount: accessPackages.length,
                  })}
            </DsHeading>
          )}
          <AccessPackageList
            items={accessPackages.map((accessPackage) => {
              return {
                as: 'button',
                titleAs: 'h3',
                size: 'md',
                id: accessPackage.id,
                title: accessPackage.name,
                description:
                  accessPackage.resources.length === 1
                    ? t('systemuser_detailpage.accesspackage_resources_list_singular')
                    : t('systemuser_detailpage.accesspackage_resources_list_plural', {
                        resourcesCount: accessPackage.resources.length,
                      }),
                onClick: () => onSelectAccessPackage(accessPackage),
              };
            })}
          />
        </div>
      )}
      {resources.length > 0 && (
        <div>
          {!hideHeadings && (
            <DsHeading
              data-size='2xs'
              level={2}
              className={classes.rightHeading}
            >
              {resources.length === 1
                ? t('systemuser_detailpage.right_resource_singular')
                : t('systemuser_detailpage.right_resource_plural', {
                    resourcesCount: resources.length,
                  })}
            </DsHeading>
          )}
          <ResourceList
            defaultItemSize='md'
            items={resources.map((resource) => {
              return {
                id: resource.identifier,
                as: 'button',
                titleAs: 'h3',
                ownerLogoUrl: resource.resourceOwnerLogoUrl,
                ownerLogoUrlAlt: resource.resourceOwnerName ?? '',
                ownerName: resource.resourceOwnerName ?? '',
                resourceName: resource.title,
                onClick: () => onSelectResource(resource),
              };
            })}
          />
        </div>
      )}
      <DsDialog
        ref={modalRef}
        onClose={closeModal}
        closedby='any'
      >
        {selectedAccessPackage && selectedResource && (
          <DsButton
            variant='tertiary'
            data-color='neutral'
            data-size='sm'
            className={classes.backButton}
            onClick={() => setSelectedResource(null)}
          >
            <ArrowLeftIcon fontSize={getButtonIconSize(true)} />
            {t('common.back')}
          </DsButton>
        )}
        {selectedAccessPackage && !selectedResource && (
          <AccessPackageInfo
            accessPackage={selectedAccessPackage}
            onSelectResource={(resource: ServiceResource) => setSelectedResource(resource)}
          />
        )}
        {selectedResource && <ResourceDetails resource={selectedResource} />}
      </DsDialog>
    </div>
  );
};
