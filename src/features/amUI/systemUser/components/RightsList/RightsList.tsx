import React, { useRef, useState } from 'react';
import { Avatar, ListItem, ResourceListItem } from '@altinn/altinn-components';
import { Button, Heading, Modal, Paragraph } from '@digdir/designsystemet-react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from './RightsList.module.css';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { getButtonIconSize } from '@/resources/utils';
import { ResourceDetails } from './ResourceDetails';
import { SysteUserAccessPackage } from '../../types';
import { useTranslation } from 'react-i18next';

interface RightsListProps {
  resources: ServiceResource[];
  accessPackages?: SysteUserAccessPackage[];
}

export const RightsList = ({ resources, accessPackages }: RightsListProps): React.ReactNode => {
  return (
    <div className={classes.rightsList}>
      <div>
        <Heading
          data-size='2xs'
          level={3}
        >
          {resources.length === 1
            ? 'Fullmakt til en enkelttjeneste'
            : `Fullmakt til ${resources.length} enkelttjenester`}
        </Heading>
        <ul className={classes.unstyledList}>
          {resources.map((resource) => (
            <ResourceInfo
              resource={resource}
              key={resource.identifier}
            />
          ))}
        </ul>
      </div>
      {accessPackages?.length && (
        <div>
          <Heading
            data-size='2xs'
            level={3}
          >
            {accessPackages.length === 1
              ? 'Fullmakt til en tilgangspakke'
              : `Fullmakt til ${accessPackages.length} tilgangspakker`}
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
  accessPackage: SysteUserAccessPackage;
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
    <li>
      <ListItem
        title={accessPackage.name}
        icon='package'
        size='md'
        badge={{
          label:
            accessPackage.resources.length === 1
              ? t('systemuser_detailpage.accesspackage_badge_singular')
              : t('systemuser_detailpage.accesspackage_badge_plural', {
                  resourcesCount: accessPackage.resources.length,
                }),
        }}
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
                <Avatar
                  size='xl'
                  type='company'
                  name={accessPackage.name}
                />
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
              <Paragraph data-size='sm'>
                {accessPackage.resources.length === 1
                  ? t('systemuser_detailpage.accesspackage_resources_singular')
                  : t('systemuser_detailpage.accesspackage_resources_plural', {
                      resourcesCount: accessPackage.resources.length,
                    })}
              </Paragraph>
              <ul className={classes.unstyledList}>
                {accessPackage.resources.map((resource) => (
                  <ResourceListItem
                    key={resource.identifier}
                    id={resource.identifier}
                    ownerName={resource.resourceOwnerName}
                    resourceName={resource.title}
                    ownerLogoUrl={resource.resourceOwnerLogoUrl}
                    ownerLogoUrlAlt={resource.resourceOwnerName}
                    size='sm'
                    onClick={() => setSelectedResource(resource)}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </Modal>
    </li>
  );
};
