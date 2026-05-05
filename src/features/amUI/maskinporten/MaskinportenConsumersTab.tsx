import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsParagraph,
  SnackbarDuration,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';

import {
  useGetMaskinportenConsumersQuery,
  useRemoveMaskinportenConsumerMutation,
} from '@/rtk/features/maskinportenApi';

import type { UserActionTarget } from '../common/UserSearch/types';
import { MaskinportenUserSearch } from './MaskinportenUserSearch';
import classes from './MaskinportenPage.module.css';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { MaskinportenDeleteDialog } from './MaskinportenDeleteDialog';

type MaskinportenConsumersTabProps = {
  party: string;
  isActive: boolean;
  canFetch: boolean;
};

export const MaskinportenConsumersTab = ({
  party,
  isActive,
  canFetch,
}: MaskinportenConsumersTabProps) => {
  const { t } = useTranslation();
  const {
    data: consumers,
    isLoading,
    error,
  } = useGetMaskinportenConsumersQuery({ party }, { skip: !isActive || !canFetch || !party });
  const { actingParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();
  const [removeConsumer, { isLoading: isRemoving }] = useRemoveMaskinportenConsumerMutation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendingDelete, setPendingDelete] = useState<{ orgNumber: string; name: string } | null>(
    null,
  );

  const handleRevoke = (user: UserActionTarget) => {
    const connection = consumers?.find((c) => c.party.id === user.id);
    if (connection?.party.organizationIdentifier) {
      setPendingDelete({ orgNumber: connection.party.organizationIdentifier, name: user.name });
      dialogRef.current?.showModal();
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await removeConsumer({ party, consumer: pendingDelete.orgNumber, cascade: true }).unwrap();
      dialogRef.current?.close();
      openSnackbar({
        message: t('maskinporten_page.remove_consumer_success', { name: pendingDelete.name }),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
      setPendingDelete(null);
    } catch {
      openSnackbar({
        message: t('maskinporten_page.remove_consumer_error', { name: pendingDelete.name }),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    }
  };

  return (
    <div className={classes.panelContent}>
      <DsParagraph>
        {t('maskinporten_page.consumers_description', {
          name: formatDisplayName({ fullName: actingParty?.name ?? '', type: 'company' }) ?? '',
        })}
      </DsParagraph>
      <MaskinportenUserSearch
        connections={consumers}
        isLoading={isLoading}
        error={error}
        emptyText={t('maskinporten_page.no_consumers')}
        canDelegate={false}
        onRevoke={handleRevoke}
        revokeLabel={t('common.delete')}
      />
      <MaskinportenDeleteDialog
        ref={dialogRef}
        heading={t('maskinporten_page.remove_consumer_heading')}
        body={t('maskinporten_page.remove_consumer_body', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('maskinporten_page.remove_consumer_confirm')}
        onConfirm={handleConfirmDelete}
        onClose={() => setPendingDelete(null)}
        isLoading={isRemoving}
      />
    </div>
  );
};
