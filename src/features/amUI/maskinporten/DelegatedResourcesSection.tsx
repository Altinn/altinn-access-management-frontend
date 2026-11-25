import { Button, DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { ServiceSearchLists } from '@/features/amUI/common/ServiceSearchLists/ServiceSearchLists';
import { matchesAnySearchWord } from '@/features/amUI/common/ResourceList/utils';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type {
  ResourceDelegation,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { getMaskinportenScopeCount, getMaskinportenScopes } from './scopeUtils';
import { ScopeSearchControls } from './ScopeSearchControls';
import classes from './DelegatedResourcesSection.module.css';

// Durable anchor that focus falls back to when an acted-on resource row is gone (e.g. after a
// revoke). The heading sits right above the list, so it's a sensible landing spot. The owning page
// passes this as the fallbackId to requestFocus; see RestoreFocus.
export const MASKINPORTEN_RESOURCES_HEADING_ID = 'maskinporten_delegated_resources_heading';

interface DelegatedResourcesSectionProps {
  resourcePermissions: ResourceDelegation[] | undefined;
  isFetching: boolean;
  hasError: boolean;
  onRemove: (resource: ServiceResource) => void;
  onResourceClick: (resource: ServiceResource) => void;
  isResourceLoading: (resourceId: string) => boolean;
  addNewResourceButton?: React.ReactNode;
  editModal?: React.ReactNode;
  /**
   * When set, searching the list also shows other scopes from the scope search, with a button
   * to give each of them. Opens a scope's info view with `error = true` when giving it failed.
   */
  otherScopes?: {
    onSelect: (resource: ServiceResource, error?: boolean) => void;
    /** Called after a scope was given from its row. */
    onGiven?: (resource: ServiceResource) => void;
  };
}

const getScopeSearchText = (resource: ServiceResource) =>
  getMaskinportenScopes(resource)
    .map((ref) => ref.reference)
    .join(' ');

// The default service search fields, plus the scope names.
const matchesScopeSearch = (resource: ServiceResource, normalizedSearch: string) => {
  if (matchesAnySearchWord(resource, normalizedSearch)) return true;
  const scopes = getScopeSearchText(resource).toLowerCase();
  return normalizedSearch
    .split(/\s/)
    .filter(Boolean)
    .some((word) => scopes.includes(word));
};

export const DelegatedResourcesSection = ({
  resourcePermissions,
  isFetching,
  hasError,
  onRemove,
  onResourceClick,
  isResourceLoading,
  addNewResourceButton,
  editModal,
  otherScopes,
}: DelegatedResourcesSectionProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobileOrSmaller();

  const getDescriptionText = (resource: ServiceResource) =>
    t('maskinporten_page.scope_count', { count: getMaskinportenScopeCount(resource) });

  const renderRemoveControl = (resource: ServiceResource) => {
    if (isMobile) return null;
    const resourceLoading = isResourceLoading(resource.identifier);
    return (
      <Button
        variant='tertiary'
        size='sm'
        loading={resourceLoading}
        disabled={resourceLoading}
        onClick={() => {
          onRemove(resource);
        }}
        aria-label={t('common.delete_poa_for', { poa_object: resource.title })}
      >
        <MinusCircleIcon aria-hidden='true' />
        {t('common.delete_poa')}
      </Button>
    );
  };

  const delegatedResources = (resourcePermissions ?? [])
    .map((delegation) => delegation.resource)
    .filter((resource) => resource.identifier);

  return (
    <section className={classes.resourceSection}>
      <DsHeading
        level={2}
        data-size='xs'
        id={MASKINPORTEN_RESOURCES_HEADING_ID}
      >
        {t('maskinporten_page.delegated_resources_heading', { count: delegatedResources.length })}
      </DsHeading>
      {hasError ? (
        <DsAlert data-color='danger'>
          <DsParagraph>{t('maskinporten_page.delegated_resources_error')}</DsParagraph>
        </DsAlert>
      ) : isFetching && !resourcePermissions ? (
        <DsSkeleton
          width='100%'
          height='2.5rem'
        />
      ) : otherScopes ? (
        <ServiceSearchLists
          delegations={resourcePermissions}
          size='sm'
          searchSource='maskinportenScopes'
          searchPlaceholder={t('maskinporten_page.search_api_placeholder')}
          matchesSearch={matchesScopeSearch}
          hideListHeadingsUntilSearch
          headingLevel={3}
          toolbarAction={addNewResourceButton}
          getSearchHitsMessage={({ assigned, other }) =>
            `${t('access_packages.search_hits_active', { count: assigned })}. ${t('access_packages.search_other_hits', { count: other })}`
          }
          assignedList={{
            heading: t('access_packages.search_active_matches'),
            noResourcesText: t('maskinporten_page.no_delegated_resources'),
            onSelect: (resource) => onResourceClick(resource),
            getDescriptionText,
            renderControls: renderRemoveControl,
          }}
          otherList={{
            heading: t('access_packages.search_other_matches'),
            onSelect: (resource) => otherScopes.onSelect(resource),
            getDescriptionText,
            renderControls: (resource) => (
              <ScopeSearchControls
                resource={resource}
                hasDelegatedResource={false}
                isDelegatedResourcesLoading={resourcePermissions === undefined}
                onSelect={otherScopes.onSelect}
                onActionSuccess={() => otherScopes.onGiven?.(resource)}
              />
            ),
          }}
        />
      ) : (
        <ResourceList
          className={classes.resourceList}
          resources={delegatedResources}
          searchPlaceholder={t('maskinporten_page.search_api_placeholder')}
          getSearchableText={(resource) =>
            `${resource.description ?? ''} ${getScopeSearchText(resource)}`.trim()
          }
          noResourcesText={t('maskinporten_page.no_delegated_resources')}
          onSelect={onResourceClick}
          size='sm'
          getDescriptionText={getDescriptionText}
          renderControls={renderRemoveControl}
        />
      )}
      {editModal}
    </section>
  );
};
