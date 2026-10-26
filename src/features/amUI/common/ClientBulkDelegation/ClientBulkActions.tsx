import React, { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsParagraph } from '@altinn/altinn-components';

import { useRestoreFocusContext, useRestoreFocusTarget } from '../RestoreFocus';

import type {
  ClientBulkDelegation,
  ClientBulkMode,
  ClientBulkNames,
} from './useClientBulkDelegation';
import type { ClientAccessTarget } from './useClientAccessDelegation';
import type { ClientBulkItems } from './getClientBulkItems';
import classes from './ClientBulkDelegation.module.css';

const clientBulkControlId = (mode: ClientBulkMode, rowKey: string) =>
  `client-bulk-${mode}-${rowKey}`;

const ARIA_LABELS = {
  client: {
    add: 'client_administration_page.give_all_for',
    remove: 'client_administration_page.delete_all_for',
  },
  agent: {
    add: 'client_administration_page.give_all_to',
    remove: 'client_administration_page.delete_all_to',
  },
} as const;

interface BulkActionButtonProps {
  id: string;
  label: string;
  ariaLabel: string;
  color?: 'danger';
  isLoading: boolean;
  isInactive: boolean;
  restoreFocusFallbackId?: string;
  onClick: () => void;
}

const BulkActionButton = ({
  id,
  label,
  ariaLabel,
  color,
  isLoading,
  isInactive,
  restoreFocusFallbackId,
  onClick,
}: BulkActionButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const requestFocus = useRestoreFocusContext()?.requestFocus;
  useRestoreFocusTarget(id);

  // Hands focus to the same button when the row moves to another section.
  useLayoutEffect(() => {
    const element = ref.current;
    return () => {
      if (element && document.activeElement === element) {
        requestFocus?.(id, restoreFocusFallbackId);
      }
    };
  }, [id, requestFocus, restoreFocusFallbackId]);

  return (
    <DsButton
      ref={ref}
      id={id}
      data-size='sm'
      variant='secondary'
      data-color={color}
      loading={isLoading}
      aria-disabled={isInactive || isLoading || undefined}
      onClick={isInactive || isLoading ? undefined : onClick}
      aria-label={ariaLabel}
    >
      <span>{label}</span>
    </DsButton>
  );
};

interface ClientBulkActionsProps {
  // Shared by the same row in different sections, unique otherwise.
  rowKey: string;
  rowKind: 'client' | 'agent';
  restoreFocusFallbackId?: string;
  target: ClientAccessTarget;
  names: ClientBulkNames;
  items: ClientBulkItems;
  bulk: ClientBulkDelegation;
}

export const ClientBulkActions = ({
  rowKey,
  rowKind,
  restoreFocusFallbackId,
  target,
  names,
  items: { missing, held },
  bulk,
}: ClientBulkActionsProps) => {
  const { t } = useTranslation();
  const ariaLabels = ARIA_LABELS[rowKind];
  const labelParams = { clientName: names.clientName, name: names.agentName };

  return (
    <div className={classes.bulkActions}>
      <DsParagraph>{t('client_administration_page.bulk_actions_description')}</DsParagraph>
      <div className={classes.bulkActionButtons}>
        <BulkActionButton
          id={clientBulkControlId('add', rowKey)}
          label={t('client_administration_page.give_all')}
          ariaLabel={t(ariaLabels.add, labelParams)}
          isLoading={bulk.isRunning(target, 'add')}
          restoreFocusFallbackId={restoreFocusFallbackId}
          isInactive={missing.length === 0 || bulk.bulkDisabled || bulk.hasActiveRun}
          onClick={() => void bulk.start('add', target, names, missing)}
        />
        <BulkActionButton
          id={clientBulkControlId('remove', rowKey)}
          label={t('client_administration_page.delete_all')}
          ariaLabel={t(ariaLabels.remove, labelParams)}
          color='danger'
          isLoading={bulk.isRunning(target, 'remove')}
          restoreFocusFallbackId={restoreFocusFallbackId}
          isInactive={held.length === 0 || bulk.bulkDisabled || bulk.hasActiveRun}
          onClick={() => void bulk.start('remove', target, names, held)}
        />
      </div>
    </div>
  );
};
