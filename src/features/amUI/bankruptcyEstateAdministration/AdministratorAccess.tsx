import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import {
  AccessPackageListItems,
  type AccessPackageListItemData,
} from '../common/AccessPackageListItems/AccessPackageListItems';
import { ClientPackageInfo } from '../common/DelegationModal/AccessPackages/ClientPackageInfo';
import dialogClasses from '../common/DelegationModal/DelegationModal.module.css';

import classes from './AdministratorAccess.module.css';

/**
 * The packages every bankruptcy estate administrator gets. They are the same for everyone, so the
 * API does not return them per administrator.
 */
const ADMINISTRATOR_PACKAGE_URNS = [
  'urn:altinn:accesspackage:hovedadministrator',
  'urn:altinn:accesspackage:konkursbo-lesetilgang',
  'urn:altinn:accesspackage:konkursbo-skrivetilgang',
];

interface AdministratorAccessProps {
  /*** The administrator whose row is open. Named in the package details */
  administrator: PartyEntity;
}

/*** What a bankruptcy estate administrator is given, shown when an administrator is expanded */
export const AdministratorAccess = ({ administrator }: AdministratorAccessProps) => {
  const { t } = useTranslation();
  const { getAccessPackageByUrn, isLoading } = useAccessPackageLookup();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [openPackage, setOpenPackage] = useState<AccessPackage>();

  const packageItems: AccessPackageListItemData[] = ADMINISTRATOR_PACKAGE_URNS.map((urn) => ({
    urn,
    accessPackage: getAccessPackageByUrn(urn),
  }))
    .filter(({ accessPackage }) => isLoading || accessPackage)
    .map(({ urn, accessPackage }) => ({
      id: urn,
      name: accessPackage?.name ?? 'xxxxxxxxxxxxxxxx',
      description: t('access_packages.package_number_of_resources', {
        count: accessPackage?.resources?.length ?? 0,
      }),
      loading: isLoading,
      color: 'company',
      as: 'button',
      titleAs: 'div',
      interactive: !!accessPackage,
      onClick: () => {
        setOpenPackage(accessPackage);
        modalRef.current?.showModal();
      },
    }));

  return (
    <div className={classes.access}>
      <DsHeading
        level={2}
        data-size='2xs'
      >
        {t('bankruptcy_estate_administration_page.info_heading')}
      </DsHeading>
      <DsParagraph data-size='sm'>
        {t('bankruptcy_estate_administration_page.administrator_role_description')}
      </DsParagraph>
      <AccessPackageListItems items={packageItems} />
      <DsParagraph
        data-size='sm'
        className={classes.notice}
      >
        <ExclamationmarkTriangleIcon
          aria-hidden='true'
          fontSize='1.25em'
        />
        {t('bankruptcy_estate_administration_page.packages_managed_per_estate')}
      </DsParagraph>
      <DsDialog
        ref={modalRef}
        className={dialogClasses.modalDialog}
        closedby='any'
        onClose={() => setOpenPackage(undefined)}
      >
        <div className={dialogClasses.content}>
          {openPackage && (
            <ClientPackageInfo
              accessPackage={openPackage}
              recipient={administrator}
              userHasAccess
            />
          )}
        </div>
      </DsDialog>
    </div>
  );
};
