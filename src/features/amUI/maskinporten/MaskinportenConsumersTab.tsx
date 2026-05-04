import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsButton,
  DsDialog,
  DsHeading,
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
      <DsDialog
        ref={dialogRef}
        closedby='any'
        onClose={() => setPendingDelete(null)}
      >
        <DsHeading data-size='sm'>{t('maskinporten_page.remove_consumer_heading')}</DsHeading>
        <DsParagraph>
          {t('maskinporten_page.remove_consumer_body', { name: pendingDelete?.name ?? '' })}
        </DsParagraph>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <DsButton
            data-color='danger'
            onClick={handleConfirmDelete}
            loading={isRemoving}
          >
            {t('maskinporten_page.remove_consumer_confirm')}
          </DsButton>
          <DsButton
            variant='secondary'
            onClick={() => dialogRef.current?.close()}
            disabled={isRemoving}
          >
            {t('common.cancel')}
          </DsButton>
        </div>
      </DsDialog>
    </div>
  );
};
