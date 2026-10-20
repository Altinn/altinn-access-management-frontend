import React, { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsParagraph, DsSpinner } from '@altinn/altinn-components';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type { Client } from '@/rtk/features/clientApi';

import { useRestoreFocusContext, useRestoreFocusTarget } from '../RestoreFocus';

import type { ClientBulkDelegation, ClientBulkMode } from './useClientBulkDelegation';
import type { ClientBulkItems } from './getClientBulkItems';
import classes from './ClientBulkDelegation.module.css';

const clientBulkControlId = (mode: ClientBulkMode, clientId: string) =>
  `client-bulk-${mode}-${clientId}`;

interface BulkActionButtonProps {
  id: string;
  label: string;
  ariaLabel: string;
  color?: 'danger';
  isLoading: boolean;
  isInactive: boolean;
  onClick: () => void;
}

// Inactive buttons use aria-disabled so they stay focusable as a RestoreFocus target.
const BulkActionButton = ({
  id,
  label,
  ariaLabel,
  color,
  isLoading,
  isInactive,
  onClick,
}: BulkActionButtonProps) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const requestFocus = useRestoreFocusContext()?.requestFocus;
  useRestoreFocusTarget(id);

  // The client row moves to the other section when its access changes. Hand focus over to the
  // same button there, which is still in the DOM when this layout cleanup runs.
  useLayoutEffect(() => {
    const element = ref.current;
    return () => {
      if (element && document.activeElement === element) {
        requestFocus?.(id);
      }
    };
  }, [id, requestFocus]);

  return (
    <DsButton
      ref={ref}
      id={id}
      data-size='sm'
      variant='secondary'
      data-color={color}
      aria-disabled={(isInactive && !isLoading) || undefined}
      onClick={isInactive || isLoading ? undefined : onClick}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <DsSpinner
          aria-label={t('common.loading')}
          data-size='sm'
        />
      ) : (
        label
      )}
    </DsButton>
  );
};

interface ClientBulkActionsProps {
  client: Client;
  items: ClientBulkItems;
  bulk: ClientBulkDelegation;
}

export const ClientBulkActions = ({
  client,
  items: { missing, held },
  bulk,
}: ClientBulkActionsProps) => {
  const { t } = useTranslation();

  const clientId = client.client.id;
  const clientName = formatEntityDisplayName(client.client);

  const runningMode = bulk.activeRun?.clientId === clientId ? bulk.activeRun.mode : undefined;

  return (
    <div className={classes.bulkActions}>
      <DsParagraph>{t('client_administration_page.bulk_actions_description')}</DsParagraph>
      <div className={classes.bulkActionButtons}>
        <BulkActionButton
          id={clientBulkControlId('add', clientId)}
          label={t('client_administration_page.give_all')}
          ariaLabel={t('client_administration_page.give_all_for', { clientName })}
          isLoading={runningMode === 'add'}
          isInactive={missing.length === 0 || bulk.disabled || !!bulk.activeRun}
          onClick={() => void bulk.start('add', clientId, clientName, missing)}
        />
        <BulkActionButton
          id={clientBulkControlId('remove', clientId)}
          label={t('client_administration_page.delete_all')}
          ariaLabel={t('client_administration_page.delete_all_for', { clientName })}
          color='danger'
          isLoading={runningMode === 'remove'}
          isInactive={held.length === 0 || bulk.disabled || !!bulk.activeRun}
          onClick={() => void bulk.start('remove', clientId, clientName, held)}
        />
      </div>
    </div>
  );
};
