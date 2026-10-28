import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import { useRestoreFocusTarget } from '../RestoreFocus';

import { getAccessName, type ClientAccessEntry } from './clientAccessEntry';
import { useClientAccessContext } from './ClientAccessContext';

// DOM id for an item's inline action button, usable as a RestoreFocus target distinct from the item.
export const clientActionControlId = (itemId: string) => `list-action-${itemId}`;

interface DelegationControlProps {
  entry: ClientAccessEntry;
  hasAccess: boolean;
}

// The inline delegate/remove button. Stays rendered and enabled while its own action runs, so
// focus is never lost to <body>.
export const DelegationControl = ({ entry, hasAccess }: DelegationControlProps) => {
  const { t } = useTranslation();
  const { runAction, requestItemFocus, addDisabled, removeDisabled } = useClientAccessContext();
  const [isLoading, setIsLoading] = useState(false);
  const id = clientActionControlId(entry.itemId);
  useRestoreFocusTarget(id);

  const onClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await runAction(hasAccess ? 'remove' : 'delegate', entry);
      if (result.ok) requestItemFocus(entry);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      id={id}
      variant='tertiary'
      disabled={(hasAccess ? removeDisabled : addDisabled) && !isLoading}
      onClick={() => void onClick()}
      aria-label={t(hasAccess ? 'common.delete_poa_for' : 'common.give_poa_for', {
        poa_object: getAccessName(entry),
      })}
    >
      {isLoading ? (
        <DsSpinner
          aria-label={t('common.loading')}
          data-size='sm'
        />
      ) : hasAccess ? (
        <>
          <MinusCircleIcon aria-hidden='true' />
          {t('common.delete_poa')}
        </>
      ) : (
        <>
          <PlusCircleIcon aria-hidden='true' />
          {t('common.give_poa')}
        </>
      )}
    </Button>
  );
};
