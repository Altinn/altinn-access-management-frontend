import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph, type AccessPackageListItemProps } from '@altinn/altinn-components';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { AccessPackageListItems } from '../AccessPackageListItems/AccessPackageListItems';

import type { ClientAccessEntry } from './clientAccessEntry';
import { useClientAccessContext } from './ClientAccessContext';
import { DelegationControl } from './DelegationControl';
import {
  ClientResourceListItems,
  type ClientResourceListItemData,
} from './ClientResourceListItems';
import classes from './ClientAccessSections.module.css';

interface ClientAccessSectionsProps {
  entries: ClientAccessEntry[];
  emptyText?: string;
}

/** One row's packages and resources, each with an inline action and a modal trigger. */
export const ClientAccessSections = ({ entries, emptyText }: ClientAccessSectionsProps) => {
  const { t } = useTranslation();
  const isMobileOrSmaller = useIsMobileOrSmaller();
  const { hasAccess, canDelegate, openModal } = useClientAccessContext();
  const packagesLabelId = useId();
  const resourcesLabelId = useId();

  const renderControl = (entry: ClientAccessEntry, entryHasAccess: boolean) =>
    !isMobileOrSmaller && entry.canAct && (entryHasAccess || canDelegate) ? (
      <DelegationControl
        entry={entry}
        hasAccess={entryHasAccess}
      />
    ) : undefined;

  const packageItems = entries.flatMap<AccessPackageListItemProps>((entry) => {
    if (entry.kind !== 'package') return [];
    const entryHasAccess = hasAccess(entry);
    return {
      id: entry.itemId,
      name: entry.accessPackage.name,
      interactive: true,
      as: 'button',
      titleAs: 'div',
      description: t('access_packages.package_number_of_resources', {
        count: entry.accessPackage.resources?.length ?? 0,
      }),
      color: entryHasAccess ? 'company' : 'neutral',
      onClick: () => openModal(entry),
      controls: renderControl(entry, entryHasAccess),
    };
  });

  const resourceItems = entries.flatMap<ClientResourceListItemData>((entry) => {
    if (entry.kind !== 'resource') return [];
    const entryHasAccess = hasAccess(entry);
    return {
      id: entry.itemId,
      resource: entry.resource,
      hasAccess: entryHasAccess,
      titleAs: 'div',
      onClick: () => openModal(entry),
      controls: renderControl(entry, entryHasAccess),
    };
  });

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
