import React, { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsParagraph, DsSpinner } from '@altinn/altinn-components';

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
  // Unique among rows in the same RestoreFocus zone; the same row in two sections shares it.
  rowKey: string;
  // What the row represents, which decides whether the labels name the client or the agent.
  rowKind: 'client' | 'agent';
  target: ClientAccessTarget;
  names: ClientBulkNames;
  items: ClientBulkItems;
  bulk: ClientBulkDelegation;
}

export const ClientBulkActions = ({
  rowKey,
  rowKind,
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
          isInactive={missing.length === 0 || bulk.bulkDisabled || bulk.hasActiveRun}
          onClick={() => void bulk.start('add', target, names, missing)}
        />
        <BulkActionButton
          id={clientBulkControlId('remove', rowKey)}
          label={t('client_administration_page.delete_all')}
          ariaLabel={t(ariaLabels.remove, labelParams)}
          color='danger'
          isLoading={bulk.isRunning(target, 'remove')}
          isInactive={held.length === 0 || bulk.bulkDisabled || bulk.hasActiveRun}
          onClick={() => void bulk.start('remove', target, names, held)}
        />
      </div>
    </div>
  );
};
