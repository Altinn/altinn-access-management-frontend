import { Button, formatDisplayName, useSnackbar } from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';

import {
  useGetMaskinportenSupplierResourcesQuery,
  useRemoveMaskinportenSupplierMutation,
  useRemoveMaskinportenSupplierResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { amUIPath } from '@/routes/paths';
import { PartyType } from '@/rtk/features/userInfoApi';

import { useMaskinportenResourceActions } from './hooks/useMaskinportenResourceActions';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import { DelegationModal, DelegationType } from '../common/DelegationModal/DelegationModal';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenDeleteDialog } from './MaskinportenDeleteDialog';
import { DelegatedResourcesSection } from './DelegatedResourcesSection';

export const SupplierPageContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  const [removeSupplier, { isLoading: isRemovingSupplier }] =
    useRemoveMaskinportenSupplierMutation();
  const [removeSupplierResource] = useRemoveMaskinportenSupplierResourceMutation();

  const { toParty, actingParty } = usePartyRepresentation();
  const party = actingParty?.partyUuid;
  const supplier = toParty?.orgNumber;
  const supplierName = toParty?.name
    ? formatDisplayName({
        fullName: toParty.name,
        type: toParty.partyTypeName === PartyType.Person ? 'person' : 'company',
      })
    : '';

  const deleteDialogRef = React.useRef<HTMLDialogElement>(null);
  const scopeModalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);

  const backUrl = `/${amUIPath.Maskinporten}#suppliers`;

  const {
    data: resourcePermissions,
    error: resourcesError,
    isFetching,
  } = useGetMaskinportenSupplierResourcesQuery({ party, supplier }, { skip: !party || !supplier });

  const { remove, isLoading } = useMaskinportenResourceActions({
    remove: (resource) =>
      removeSupplierResource({
        party: party!,
        supplier: supplier!,
        resource: resource.identifier,
      }).unwrap(),
  });

  const handleRemove = (resource: ServiceResource) =>
    remove(resource, {
      onSuccess: (r) =>
        openSnackbar({
          message: t('single_rights.delete_singleRight_success_message', {
            name: supplierName,
            resourceTitle: r.title,
          }),
          color: 'success',
        }),
      onError: (r) =>
        openSnackbar({
          message: t('single_rights.delete_singleRight_error_message', {
            name: supplierName,
            resourceTitle: r.title,
          }),
          color: 'danger',
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
      });
      navigate(backUrl);
    } catch {
      openSnackbar({
        message: t('maskinporten_page.remove_supplier_error', { name: supplierName }),
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
          {t('maskinporten_page.remove_supplier_confirm')}
        </Button>,
      ]}
    >
      <UserPageHeader
        direction='to'
        displayRoles={false}
      />
      <DelegatedResourcesSection
        resourcePermissions={resourcePermissions}
        isFetching={isFetching}
        hasError={!!resourcesError}
        onRemove={handleRemove}
        isResourceLoading={isLoading}
        onResourceClick={(r) => {
          setSelectedResource(r);
          scopeModalRef.current?.showModal();
        }}
        editModal={
          <EditModal
            ref={scopeModalRef}
            maskinportenScope={selectedResource ?? undefined}
            onClose={() => setSelectedResource(null)}
          />
        }
        addNewResourceButton={
          <DelegationModal
            delegationType={DelegationType.MaskinportenScope}
            availableActions={[DelegationAction.DELEGATE]}
          />
        }
      />
      <MaskinportenDeleteDialog
        ref={deleteDialogRef}
        heading={t('maskinporten_page.remove_supplier_heading')}
        body={t('maskinporten_page.remove_supplier_body', { name: supplierName })}
        confirmLabel={t('maskinporten_page.remove_supplier_confirm')}
        onConfirm={handleConfirmDeleteSupplier}
        isLoading={isRemovingSupplier}
      />
    </PageContainer>
  );
};
