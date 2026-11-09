import { DsButton, DsSkeleton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import type { UserSearchNode } from '../UserSearch/types';

export const UserListActions = ({
  user,
  onDelegate,
  onRevoke,
  onRequest,
  isLoading,
  delegateLabel,
  revokeLabel,
}: {
  user: UserSearchNode;
  onDelegate?: (user: UserSearchNode) => void;
  onRevoke?: (user: UserSearchNode) => void;
  onRequest?: (user: UserSearchNode) => void;
  isLoading?: boolean;
  delegateLabel?: string;
  revokeLabel?: string;
}) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const displayName = formatEntityDisplayName(user);

  // An action is offered when its handler is passed. Inherited access and rights fixed by the vendor
  // (standard system users) can't be given, requested or revoked.
  const hasAction = !!(onDelegate || onRequest || onRevoke);
  if (!hasAction || isSmall || user.isInherited || user.isVendorFixedRights) {
    return null;
  }
  if (isLoading) {
    return (
      <DsButton
        variant='tertiary'
        data-size='md'
        loading
      >
        <DsSkeleton
          variant='text'
          width={20}
          aria-label={t('common.loading')}
        />
      </DsButton>
    );
  }
  return (
    <>
      {onDelegate && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onDelegate(user)}
          aria-label={
            delegateLabel ? undefined : t('common.give_poa_to_name', { name: displayName })
          }
        >
          <PlusCircleIcon aria-hidden='true' />
          {delegateLabel ?? t('common.give_poa')}
        </DsButton>
      )}
      {onRequest && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRequest(user)}
          aria-label={t('common.request_poa')}
        >
          <PlusCircleIcon aria-hidden='true' />
          {t('common.request_poa')}
        </DsButton>
      )}
      {onRevoke && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRevoke(user)}
          aria-label={
            revokeLabel ? undefined : t('common.delete_poa_to_name', { name: displayName })
          }
        >
          <MinusCircleIcon aria-hidden='true' />
          {revokeLabel ?? t('common.delete_poa')}
        </DsButton>
      )}
    </>
  );
};
