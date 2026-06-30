import { Button, formatDisplayName, useSnackbar } from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { TrashIcon } from '@navikt/aksel-icons';

import {
  useGetMaskinportenConsumerResourcesQuery,
  useRemoveMaskinportenConsumerMutation,
  useRemoveMaskinportenConsumerResourceMutation,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { amUIPath } from '@/routes/paths';
import { PartyType } from '@/rtk/features/userInfoApi';

import { useMaskinportenResourceActions } from './hooks/useMaskinportenResourceActions';
import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { UserPageHeader } from '../common/UserPageHeader/UserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusContext,
  useRestoreFocusOnDataChange,
} from '../common/RestoreFocus';
import { MaskinportenDeleteDialog } from './MaskinportenDeleteDialog';
import {
  DelegatedResourcesSection,
  MASKINPORTEN_RESOURCES_HEADING_ID,
} from './DelegatedResourcesSection';

const backUrl = `/${amUIPath.Maskinporten}#consumers`;

const ConsumerPageContentInner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { fromParty, actingParty } = usePartyRepresentation();
  const deleteDialogRef = React.useRef<HTMLDialogElement>(null);
  const scopeModalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);
  const [removeConsumer, { isLoading: isRemovingConsumer }] =
    useRemoveMaskinportenConsumerMutation();
  const [removeConsumerResource] = useRemoveMaskinportenConsumerResourceMutation();
  const consumerOrgNumber = fromParty?.orgNumber;
  const actingPartyUuid = actingParty?.partyUuid;
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

  // Removing a resource refetches the list and drops the row; restore focus once that lands. The
  // edit modal restores synchronously on close. Both fall back to the section heading if the row is
  // gone (e.g. revoked from inside the modal).
  const requestFocusOnDataChange = useRestoreFocusOnDataChange(resourcePermissions);
  const restoreFocusContext = useRestoreFocusContext();

  const handleRemove = (resource: ServiceResource) =>
    remove(resource, {
      onSuccess: (r) => {
        requestFocusOnDataChange(r.identifier, MASKINPORTEN_RESOURCES_HEADING_ID);
        openSnackbar({
          message: t('single_rights.delete_singleRight_success_message', {
            name: consumerName,
            resourceTitle: r.title,
          }),
          color: 'success',
        });
      },
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
      <RestoreFocusFallback>
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
              availableActions={[DelegationAction.REVOKE]}
              onClose={() => {
                // Restore focus to the row that opened the modal before clearing state. If the
                // resource was revoked inside the modal its row is gone, so the heading catches it.
                if (selectedResource) {
                  restoreFocusContext?.requestFocus(
                    selectedResource.identifier,
                    MASKINPORTEN_RESOURCES_HEADING_ID,
                  );
                }
                setSelectedResource(null);
              }}
            />
          }
        />
      </RestoreFocusFallback>
      <MaskinportenDeleteDialog
        ref={deleteDialogRef}
        heading={t('maskinporten_page.remove_consumer_heading')}
        body={t('maskinporten_page.remove_consumer_body', { name: consumerName })}
        confirmLabel={t('maskinporten_page.remove_consumer_confirm')}
        onConfirm={handleConfirmDeleteConsumer}
        isLoading={isRemovingConsumer}
      />
    </PageContainer>
  );
};

export const ConsumerPageContent = () => {
  const restoreFocus = useRestoreFocus();
  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <ConsumerPageContentInner />
    </RestoreFocusProvider>
  );
};
