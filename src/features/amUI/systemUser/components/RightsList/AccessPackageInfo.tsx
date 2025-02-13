import React, { useRef, useState } from 'react';
import { ListItem } from '@altinn/altinn-components';
import { Button, Heading, Modal, Paragraph, Tabs } from '@digdir/designsystemet-react';
import { ArrowLeftIcon, PackageIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { getButtonIconSize } from '@/resources/utils';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';
import { ResourceDetails } from './ResourceDetails';
import { ResourceItem } from './ResourceItem';

interface AccessPackageInfoProps {
  accessPackage: SystemUserAccessPackage;
}
export const AccessPackageInfo = ({
  accessPackage,
}: AccessPackageInfoProps): React.ReactElement => {
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

  const description =
    accessPackage.resources.length === 1
      ? t('systemuser_detailpage.accesspackage_resources_singular')
      : t('systemuser_detailpage.accesspackage_resources_plural', {
          resourcesCount: accessPackage.resources.length,
        });

  return (
    <li className={classes.resourceListItem}>
      <ListItem
        title={accessPackage.name}
        description={description}
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
                    <ResourceItem
                      resource={resource}
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
