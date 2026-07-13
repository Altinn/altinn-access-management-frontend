import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItem,
  DsDialog,
  DsHeading,
  ResourceListItem,
  List,
  DsSkeleton,
} from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

import type { SystemUserAccessPackage } from '../../types';
import type { ExtendedAccessPackage } from '@/features/amUI/common/AccessPackageList/useAreaPackageList';

import classes from './RightsList.module.css';
import { PackageHeader } from '@/features/amUI/common/DelegationModal/AccessPackages/PackageHeader';
import { PackageMeta } from '@/features/amUI/common/DelegationModal/AccessPackages/PackageMeta';
import { ResourceDetails } from './ResourceDetails';

interface RightsListProps {
  resources: ServiceResource[];
  accessPackages: SystemUserAccessPackage[];
  hideHeadings?: boolean;
  isLoading?: boolean;
  headingLevel?: 2 | 3 | 4;
}

const mapSystemUserAccessPackageToExtended = (
  accessPackage: SystemUserAccessPackage,
): ExtendedAccessPackage => ({
  ...accessPackage,
  resources: accessPackage.resources.map(
    (resource): PackageResource => ({
      id: resource.identifier,
      identifier: resource.identifier,
      name: resource.title,
      title: resource.title,
      description: resource.description ?? '',
      refId: resource.identifier,
      provider: {
        id: '',
        name: resource.resourceOwnerName,
        refId: '',
        logoUrl: resource.resourceOwnerLogoUrl,
        code: '',
        typeId: '',
      },
      resourceOwnerName: resource.resourceOwnerName,
      resourceOwnerLogoUrl: resource.resourceOwnerLogoUrl,
      resourceOwnerOrgcode: resource.resourceOwnerOrgcode,
      resourceOwnerOrgNumber: resource.resourceOwnerOrgNumber,
      resourceOwnerType: '',
    }),
  ),
});

export const RightsList = ({
  resources,
  accessPackages,
  hideHeadings,
  isLoading,
  headingLevel,
}: RightsListProps): React.ReactNode => {
  const { t } = useTranslation();
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const modalRef = React.useRef<HTMLDialogElement>(null);

  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);
  const [selectedAccessPackage, setSelectedAccessPackage] =
    React.useState<ExtendedAccessPackage | null>(null);

  const onSelectResource = (resource: ServiceResource): void => {
    setSelectedResource(resource);
    modalRef.current?.showModal();
  };

  const onSelectAccessPackage = (accessPackage: SystemUserAccessPackage): void => {
    setSelectedAccessPackage(mapSystemUserAccessPackageToExtended(accessPackage));
    modalRef.current?.showModal();
  };

  const closeModal = (): void => {
    setSelectedAccessPackage(null);
    modalRef.current?.close();
  };

  if (isLoading) {
    return (
      <div className={classes.rightsListWrapper}>
        <div>
          {!hideHeadings && (
            <DsSkeleton
              variant='text'
              width={20}
            />
          )}
          <List className={classes.rightsList}>
            <AccessPackageListItem
              id='1'
              size='md'
              loading={true}
              name='xxxxxxxxxxxxxxxxxxxxxxxxxx'
              description={'xxxxxxxxx'}
              interactive={false}
            />
            <AccessPackageListItem
              id='2'
              size='md'
              loading={true}
              name='xxxxxxxxxxxxxxxxxxxxxxxxxx'
              description={'xxxxxxxxx'}
              interactive={false}
            />
          </List>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.rightsListWrapper}>
      {accessPackages.length > 0 && (
        <div>
          {!hideHeadings && (
            <RightsListHeading
              headingLevel={headingLevel}
              text={
                accessPackages.length === 1
                  ? t('systemuser_detailpage.right_accesspackage_singular')
                  : t('systemuser_detailpage.right_accesspackage_plural', {
                      accessPackageCount: accessPackages.length,
                    })
              }
            />
          )}
          <List className={classes.rightsList}>
            {accessPackages.map((accessPackage) => (
              <AccessPackageListItem
                key={accessPackage.id}
                id={accessPackage.id}
                titleAs='span'
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
            <RightsListHeading
              headingLevel={headingLevel}
              text={
                resources.length === 1
                  ? t('systemuser_detailpage.right_resource_singular')
                  : t('systemuser_detailpage.right_resource_plural', {
                      resourcesCount: resources.length,
                    })
              }
            />
          )}
          <List className={classes.rightsList}>
            {resources.map((resource) => {
              const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');
              return (
                <ResourceListItem
                  key={resource.identifier}
                  id={resource.identifier}
                  as='button'
                  titleAs='span'
                  size='md'
                  ownerLogoUrl={emblem ?? resource.resourceOwnerLogoUrl}
                  ownerLogoUrlAlt={resource.resourceOwnerName ?? ''}
                  ownerName={resource.resourceOwnerName ?? ''}
                  resourceName={resource.title}
                  onClick={() => onSelectResource(resource)}
                />
              );
            })}
          </List>
        </div>
      )}

      <DsDialog
        ref={modalRef}
        onClose={closeModal}
        closedby='any'
      >
        {selectedAccessPackage && (
          <div data-size='sm'>
            <PackageHeader name={selectedAccessPackage.name} />
            <PackageMeta accessPackage={selectedAccessPackage} />
          </div>
        )}
        {selectedResource && <ResourceDetails resource={selectedResource} />}
      </DsDialog>
    </div>
  );
};

interface RightsListHeadingProps {
  headingLevel?: 2 | 3 | 4;
  text: string;
}
const RightsListHeading = ({ headingLevel, text }: RightsListHeadingProps) => {
  return (
    <DsHeading
      data-size='2xs'
      level={headingLevel ?? 2}
    >
      {text}
    </DsHeading>
  );
};
