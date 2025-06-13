import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessPackageList, DsButton, DsDialog, DsHeading, List } from '@altinn/altinn-components';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import { getButtonIconSize } from '@/resources/utils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { AccessPackageInfo } from './AccessPackageInfo';
import { ResourceDetails } from './ResourceDetails';

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
                size: 'md',
                id: accessPackage.id,
                ariaLabel: accessPackage.name,
                title: { as: 'h3', children: accessPackage.name },
                description: {
                  as: 'div',
                  children:
                    accessPackage.resources.length === 1
                      ? t('systemuser_detailpage.accesspackage_resources_list_singular')
                      : t('systemuser_detailpage.accesspackage_resources_list_plural', {
                          resourcesCount: accessPackage.resources.length,
                        }),
                },
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
          <List
            size='md'
            items={resources.map((resource) => {
              return {
                id: resource.identifier,
                as: 'button',
                ariaLabel: resource.title,
                title: { as: 'h3', children: resource.title },
                description: { as: 'div', children: resource.resourceOwnerName },
                icon: {
                  name: resource.resourceOwnerName,
                  imageUrl: resource.resourceOwnerLogoUrl,
                  imageUrlAlt: resource.resourceOwnerName,
                  type: 'company',
                },
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
