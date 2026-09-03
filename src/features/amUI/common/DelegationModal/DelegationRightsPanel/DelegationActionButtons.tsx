import type { ReactNode } from 'react';
import { Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon } from '@navikt/aksel-icons';

export interface DelegationActionButtonsProps {
  /** Show the give/update button. */
  showDelegate: boolean;
  /** Drives the give-vs-update label and which handler the button calls. */
  hasExistingAccess: boolean;
  isDelegateDisabled: boolean;
  onDelegate: () => void;
  onUpdate: () => void;
  /** Show the delete button. */
  showRevoke: boolean;
  isRevokeDisabled?: boolean;
  onRevoke?: () => void;
  /** Flow-specific buttons rendered after the standard ones. */
  children?: ReactNode;
}

export const DelegationActionButtons = ({
  showDelegate,
  hasExistingAccess,
  isDelegateDisabled,
  onDelegate,
  onUpdate,
  showRevoke,
  isRevokeDisabled = false,
  onRevoke,
  children,
}: DelegationActionButtonsProps) => {
  const { t } = useTranslation();

  return (
    <>
      {showDelegate && (
        <Button
          data-size='sm'
          disabled={isDelegateDisabled}
          onClick={hasExistingAccess ? onUpdate : onDelegate}
        >
          {hasExistingAccess ? t('common.update_poa') : t('common.give_poa')}
        </Button>
      )}
      {showRevoke && (
        <Button
          data-size='sm'
          variant={showDelegate ? 'tertiary' : 'primary'}
          onClick={onRevoke}
          disabled={isRevokeDisabled}
          color='danger'
        >
          <MinusCircleIcon aria-hidden='true' />
          {t('common.delete_poa')}
        </Button>
      )}
      {children}
    </>
  );
};
