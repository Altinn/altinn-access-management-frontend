import { Button, DsAlert, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type {
  ResourceDelegation,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { getMaskinportenScopeCount, getMaskinportenScopes } from './scopeUtils';
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
}

export const DelegatedResourcesSection = ({
  resourcePermissions,
  isFetching,
  hasError,
  onRemove,
  onResourceClick,
  isResourceLoading,
  addNewResourceButton,
  editModal,
}: DelegatedResourcesSectionProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobileOrSmaller();

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
      ) : (
        <ResourceList
          className={classes.resourceList}
          resources={delegatedResources}
          searchPlaceholder={t('maskinporten_page.search_api_placeholder')}
          getSearchableText={(resource) => {
            const scopes = getMaskinportenScopes(resource)
              .map((ref) => ref.reference)
              .join(' ');
            return `${resource.description ?? ''} ${scopes}`.trim();
          }}
          delegationModal={addNewResourceButton}
          noResourcesText={t('maskinporten_page.no_delegated_resources')}
          showDetails={false}
          onSelect={onResourceClick}
          size='sm'
          getDescriptionText={(resource) =>
            t('maskinporten_page.scope_count', { count: getMaskinportenScopeCount(resource) })
          }
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
        />
      )}
      {editModal}
    </section>
  );
};
