import {
  Button,
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { MinusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useGetMaskinportenConsumerResourcesQuery,
  useRemoveMaskinportenConsumerMutation,
  useRemoveMaskinportenConsumerResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useFilteredResources } from '@/features/amUI/common/ResourceList/useFilteredResources';
import { amUIPath } from '@/routes/paths';
import { PartyType } from '@/rtk/features/userInfoApi';

import { ScopeList } from './ScopeList';
import { getMaskinportenScopes } from './scopeUtils';
import { useMaskinportenResourceActions } from './hooks/useMaskinportenResourceActions';
import classes from './MaskinportenPage.module.css';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenDeleteDialog } from './MaskinportenDeleteDialog';

const backUrl = `/${amUIPath.Maskinporten}?tab=consumers`;

export const ConsumerPageContent = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobileOrSmaller();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { fromParty, toParty } = usePartyRepresentation();
  const [search, setSearch] = React.useState('');
  const [filterState, setFilterState] = React.useState<string[]>([]);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);
  const scopeModalRef = React.useRef<HTMLDialogElement>(null);
  const deleteDialogRef = React.useRef<HTMLDialogElement>(null);
  const [removeConsumer, { isLoading: isRemovingConsumer }] =
    useRemoveMaskinportenConsumerMutation();
  const [removeConsumerResource] = useRemoveMaskinportenConsumerResourceMutation();
  const consumerOrgNumber = fromParty?.orgNumber;
  const actingPartyUuid = toParty?.partyUuid;
  const { remove, isLoading } = useMaskinportenResourceActions({
    remove: (resource) =>
      removeConsumerResource({
        party: actingPartyUuid!,
        consumer: consumerOrgNumber!,
        resource: resource.identifier,
      }).unwrap(),
  });
  const consumerName = fromParty?.name
    ? formatDisplayName({
        fullName: fromParty.name,
        type: fromParty.partyTypeName === PartyType.Person ? 'person' : 'company',
      })
    : '';
  const {
    data: resourcePermissions,
    error: resourcesError,
    isFetching,
  } = useGetMaskinportenConsumerResourcesQuery(
    { party: actingPartyUuid, consumer: consumerOrgNumber },
    { skip: !actingPartyUuid || !consumerOrgNumber },
  );

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

  const handleRemove = (resource: ServiceResource) =>
    remove(resource, {
      onSuccess: (r) =>
        openSnackbar({
          message: t('single_rights.delete_singleRight_success_message', {
            name: consumerName,
            resourceTitle: r.title,
          }),
          color: 'success',
        }),
      onError: (r) =>
        openSnackbar({
          message: t('single_rights.delete_singleRight_error_message', {
            name: consumerName,
            resourceTitle: r.title,
          }),
          color: 'danger',
        }),
    });

  const handleConfirmDeleteConsumer = async () => {
    if (!actingPartyUuid || !consumerOrgNumber) return;
    try {
      await removeConsumer({
        party: actingPartyUuid,
        consumer: consumerOrgNumber,
        cascade: true,
      }).unwrap();
      deleteDialogRef.current?.close();
      openSnackbar({
        message: t('maskinporten_page.remove_consumer_success', { name: consumerName }),
        color: 'success',
      });
      navigate(backUrl);
    } catch {
      openSnackbar({
        message: t('maskinporten_page.remove_consumer_error', { name: consumerName }),
        color: 'danger',
      });
    }
  };

  return (
    <PageContainer
      backUrl={backUrl}
      contentActions={[
        <Button
          key='delete'
          size='sm'
          variant='tertiary'
          onClick={() => deleteDialogRef.current?.showModal()}
        >
          <TrashIcon aria-hidden='true' />
          {t('maskinporten_page.remove_consumer_confirm')}
        </Button>,
      ]}
    >
      <UserPageHeader
        direction='from'
        displayRoles={false}
      />
      <section className={classes.resourceSection}>
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('maskinporten_page.delegated_resources_heading', { count: delegatedResources.length })}
        </DsHeading>
        {resourcesError ? (
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
            resources={filteredResources}
            search={search}
            setSearch={setSearch}
            filterState={filterState}
            setFilterState={setFilterState}
            serviceOwnerOptions={serviceOwnerOptions}
            onSelect={(resource) => {
              setSelectedResource(resource);
              scopeModalRef.current?.showModal();
            }}
            renderControls={(resource) => {
              const resourceLoading = isLoading(resource.identifier);
              return (
                <Button
                  variant='tertiary'
                  size='sm'
                  loading={resourceLoading}
                  aria-disabled={resourceLoading}
                  onClick={() => {
                    if (resourceLoading) return;
                    handleRemove(resource);
                  }}
                  aria-label={t('common.delete_poa_for', { poa_object: resource.title })}
                >
                  <MinusCircleIcon aria-hidden='true' />
                  {!isMobile && t('common.delete_poa')}
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
        <EditModal
          ref={scopeModalRef}
          maskinportenScope={selectedResource ?? undefined}
          availableActions={[DelegationAction.REVOKE]}
          onClose={() => setSelectedResource(null)}
        />
        <MaskinportenDeleteDialog
          ref={deleteDialogRef}
          heading={t('maskinporten_page.remove_consumer_heading')}
          body={t('maskinporten_page.remove_consumer_body', { name: consumerName })}
          confirmLabel={t('maskinporten_page.remove_consumer_confirm')}
          onConfirm={handleConfirmDeleteConsumer}
          isLoading={isRemovingConsumer}
        />
      </section>
    </PageContainer>
  );
};
