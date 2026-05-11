import {
  Button,
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  SnackbarDuration,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { MinusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useGetMaskinportenResourcesQuery,
  useRemoveMaskinportenSupplierMutation,
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
import { DelegationModal, DelegationType } from '../common/DelegationModal/DelegationModal';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenDeleteDialog } from './MaskinportenDeleteDialog';

export const SupplierPageContent = () => {
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
  const [removeSupplier, { isLoading: isRemovingSupplier }] =
    useRemoveMaskinportenSupplierMutation();
  const party = fromParty?.partyUuid;
  const supplier = toParty?.orgNumber;
  const supplierName = toParty?.name
    ? formatDisplayName({
        fullName: toParty.name,
        type: toParty.partyTypeName === PartyType.Person ? 'person' : 'company',
      })
    : '';
  const {
    data: resourcePermissions,
    error: resourcesError,
    isFetching,
  } = useGetMaskinportenResourcesQuery({ party, supplier }, { skip: !party || !supplier });
  const { remove, isLoading } = useMaskinportenResourceActions({ party, supplier });

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
            name: supplierName,
            resourceTitle: r.title,
          }),
          color: 'success',
          duration: SnackbarDuration.normal,
        }),
      onError: (r) =>
        openSnackbar({
          message: t('single_rights.delete_singleRight_error_message', {
            name: supplierName,
            resourceTitle: r.title,
          }),
          color: 'danger',
          duration: SnackbarDuration.infinite,
        }),
    });

  const handleConfirmDeleteSupplier = async () => {
    if (!party || !supplier) return;
    try {
      await removeSupplier({ party, supplier, cascade: true }).unwrap();
      deleteDialogRef.current?.close();
      openSnackbar({
        message: t('maskinporten_page.remove_supplier_success', { name: supplierName }),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
      navigate(`/${amUIPath.Maskinporten}`);
    } catch {
      openSnackbar({
        message: t('maskinporten_page.remove_supplier_error', { name: supplierName }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  return (
    <PageContainer
      backUrl={`/${amUIPath.Maskinporten}`}
      contentActions={[
        <Button
          key='delete'
          size='sm'
          variant='tertiary'
          onClick={() => deleteDialogRef.current?.showModal()}
        >
          <TrashIcon aria-hidden='true' />
          {t('maskinporten_page.remove_supplier_confirm')}
        </Button>,
      ]}
    >
      <UserPageHeader
        direction='to'
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
            addNewResourceButton={
              <DelegationModal
                delegationType={DelegationType.MaskinportenScope}
                availableActions={[DelegationAction.DELEGATE]}
              />
            }
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
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    if (resourceLoading) return;
                    event.stopPropagation();
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
          onClose={() => setSelectedResource(null)}
        />
        <MaskinportenDeleteDialog
          ref={deleteDialogRef}
          heading={t('maskinporten_page.remove_supplier_heading')}
          body={t('maskinporten_page.remove_supplier_body', { name: supplierName })}
          confirmLabel={t('maskinporten_page.remove_supplier_confirm')}
          onConfirm={handleConfirmDeleteSupplier}
          isLoading={isRemovingSupplier}
        />
      </section>
    </PageContainer>
  );
};
