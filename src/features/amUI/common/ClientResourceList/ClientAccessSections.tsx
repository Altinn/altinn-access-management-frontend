import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';

import {
  AccessPackageListItems,
  type AccessPackageListItemData,
} from '../AccessPackageListItems/AccessPackageListItems';

import {
  ClientResourceListItems,
  type ClientResourceListItemData,
} from './ClientResourceListItems';
import classes from './ClientAccessSections.module.css';

interface ClientAccessSectionsProps {
  packageItems: AccessPackageListItemData[];
  resourceItems: ClientResourceListItemData[];
  emptyText?: string;
}

export const ClientAccessSections = ({
  packageItems,
  resourceItems,
  emptyText,
}: ClientAccessSectionsProps) => {
  const { t } = useTranslation();
  const packagesLabelId = useId();
  const resourcesLabelId = useId();

  if (packageItems.length === 0 && resourceItems.length === 0) {
    return emptyText ? <DsParagraph>{emptyText}</DsParagraph> : null;
  }

  if (resourceItems.length === 0) {
    return <AccessPackageListItems items={packageItems} />;
  }

  return (
    <div className={classes.sections}>
      {packageItems.length > 0 && (
        <div>
          <DsParagraph
            id={packagesLabelId}
            className={classes.sectionLabel}
          >
            {t('client_administration_page.packages_heading')}
          </DsParagraph>
          <AccessPackageListItems
            items={packageItems}
            labelledBy={packagesLabelId}
          />
        </div>
      )}
      <div>
        <DsParagraph
          id={resourcesLabelId}
          className={classes.sectionLabel}
        >
          {t('client_administration_page.single_rights_heading')}
        </DsParagraph>
        <ClientResourceListItems
          items={resourceItems}
          labelledBy={resourcesLabelId}
        />
      </div>
    </div>
  );
};
