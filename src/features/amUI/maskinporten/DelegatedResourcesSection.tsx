import { Button, DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useFilteredResources } from '@/features/amUI/common/ResourceList/useFilteredResources';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  type RestoreFocus,
} from '@/features/amUI/common/RestoreFocus';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type {
  ResourceDelegation,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { ScopeList } from './ScopeList';
import { getMaskinportenScopes } from './scopeUtils';
import classes from './DelegatedResourcesSection.module.css';

interface DelegatedResourcesSectionProps {
  resourcePermissions: ResourceDelegation[] | undefined;
  isFetching: boolean;
  hasError: boolean;
  onRemove: (resource: ServiceResource) => void;
  onResourceClick: (resource: ServiceResource) => void;
  isResourceLoading: (resourceId: string) => boolean;
  restoreFocus: RestoreFocus;
  addNewResourceButton?: React.ReactNode;
  editModal?: React.ReactNode;
}

export const DelegatedResourcesSection = ({
  resourcePermissions,
  isFetching,
  hasError,
  onRemove,
  onResourceClick,
  isResourceLoading,
  restoreFocus,
  addNewResourceButton,
  editModal,
}: DelegatedResourcesSectionProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobileOrSmaller();
  const [search, setSearch] = React.useState('');
  const [filterState, setFilterState] = React.useState<string[]>([]);

  const delegatedResources = (resourcePermissions ?? [])
    .map((delegation) => delegation.resource)
    .filter((resource) => resource.identifier);

  const { resources: filteredResources } = useFilteredResources<ServiceResource>({
    resources: delegatedResources,
    searchString: search,
    serviceOwnerFilter: filterState,
    getResourceName: (resource) => resource.title ?? '',
    getOwnerName: (resource) => resource.resourceOwnerName ?? '',
    getOwnerOrgCode: (resource) => resource.resourceOwnerOrgcode ?? '',
    getDescription: (resource) => {
      const scopes = getMaskinportenScopes(resource)
        .map((ref) => ref.reference)
        .join(' ');
      return `${resource.description ?? ''} ${scopes}`.trim();
    },
  });

  const serviceOwnerOptions = React.useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();
    for (const resource of delegatedResources) {
      const code = resource.resourceOwnerOrgcode;
      if (!code || seen.has(code)) continue;
      seen.set(code, {
        value: code,
        label: resource.resourceOwnerName ?? code,
      });
    }
    return Array.from(seen.values());
  }, [delegatedResources]);

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <section className={classes.resourceSection}>
        <RestoreFocusFallback>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('maskinporten_page.delegated_resources_heading', {
              count: delegatedResources.length,
            })}
          </DsHeading>
        </RestoreFocusFallback>
        {hasError ? (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('maskinporten_page.delegated_resources_error')}</DsParagraph>
          </DsAlert>
        ) : isFetching && !resourcePermissions ? (
          <DsSkeleton
            width='100%'
            height='2.5rem'
          />
        ) : (
          <ScopeList
            addNewResourceButton={addNewResourceButton}
            resources={filteredResources}
            search={search}
            setSearch={setSearch}
            filterState={filterState}
            setFilterState={setFilterState}
            serviceOwnerOptions={serviceOwnerOptions}
            onSelect={onResourceClick}
            renderControls={(resource) => {
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
            }}
            emptyState={
              <DsParagraph data-size='md'>
                {delegatedResources.length === 0
                  ? t('maskinporten_page.no_delegated_resources')
                  : t('resource_list.no_resources_filtered', { searchTerm: search })}
              </DsParagraph>
            }
          />
        )}
        {editModal}
      </section>
    </RestoreFocusProvider>
  );
};
