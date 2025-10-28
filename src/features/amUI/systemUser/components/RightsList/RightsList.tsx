import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItem,
  DsButton,
  DsDialog,
  DsHeading,
  List,
} from '@altinn/altinn-components';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import { getButtonIconSize } from '@/resources/utils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { ResourceDetailsContent } from '@/features/amUI/common/ResourceList/ResourceDetails';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { AccessPackageInfo } from './AccessPackageInfo';

interface RightsListProps {
  resources: ServiceResource[];
  accessPackages: SystemUserAccessPackage[];
  hideHeadings?: boolean;
  headingLevel?: 2 | 3 | 4;
}

export const RightsList = ({
  resources,
  accessPackages,
  hideHeadings,
  headingLevel,
}: RightsListProps): React.ReactNode => {
  const { t } = useTranslation();
  const { getProviderLogoUrl } = useProviderLogoUrl();
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

  const listItemHeadingLevel = `h${Math.min(6, (headingLevel ?? 2) + 1)}` as 'h3' | 'h4' | 'h5';

  return (
    <div className={classes.rightsListWrapper}>
      {accessPackages.length > 0 && (
        <div>
          {!hideHeadings && (
            <DsHeading
              data-size='2xs'
              level={headingLevel ?? 2}
            >
              {accessPackages.length === 1
                ? t('systemuser_detailpage.right_accesspackage_singular')
                : t('systemuser_detailpage.right_accesspackage_plural', {
                    accessPackageCount: accessPackages.length,
                  })}
            </DsHeading>
          )}
          <List className={classes.rightsList}>
            {accessPackages.map((accessPackage) => (
              <AccessPackageListItem
                key={accessPackage.id}
                id={accessPackage.id}
                titleAs={listItemHeadingLevel}
                size='md'
                name={accessPackage.name}
                description={
                  accessPackage.resources.length === 1
                    ? t('systemuser_detailpage.accesspackage_resources_list_singular')
                    : t('systemuser_detailpage.accesspackage_resources_list_plural', {
                        resourcesCount: accessPackage.resources.length,
                      })
                }
                onClick={() => onSelectAccessPackage(accessPackage)}
              />
            ))}
          </List>
        </div>
      )}
      {resources.length > 0 && (
        <div>
          {!hideHeadings && (
            <DsHeading
              data-size='2xs'
              level={headingLevel ?? 2}
            >
              {resources.length === 1
                ? t('systemuser_detailpage.right_resource_singular')
                : t('systemuser_detailpage.right_resource_plural', {
                    resourcesCount: resources.length,
                  })}
            </DsHeading>
          )}
          <div className={classes.rightsList}>
            <ResourceList
              resources={resources}
              enableSearch={false}
              showMoreButton={false}
              showDetails={false}
              onSelect={onSelectResource}
              size='md'
              titleAs={listItemHeadingLevel}
              getOrgCode={(resource) =>
                resource.resourceOwnerOrgNumber ?? resource.resourceOwnerOrgcode
              }
              getLogoUrl={(resource) => resource.resourceOwnerLogoUrl}
              getLogoAlt={(resource) => resource.resourceOwnerName ?? ''}
              getOwnerName={(resource) => resource.resourceOwnerName ?? ''}
            />
          </div>
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
        {selectedResource && (
          <ResourceDetailsContent
            resource={selectedResource}
            providerLogoUrl={
              getProviderLogoUrl(selectedResource.resourceOwnerOrgNumber ?? '') ??
              selectedResource.resourceOwnerLogoUrl
            }
          />
        )}
      </DsDialog>
    </div>
  );
};
