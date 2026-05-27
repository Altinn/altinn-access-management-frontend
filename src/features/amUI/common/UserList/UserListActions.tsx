import { DsButton, DsSkeleton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { ExtendedUser } from '@/rtk/features/userInfoApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

export const UserListActions = ({
  user,
  onDelegate,
  onRevoke,
  onRequest,
  availableAction,
  isLoading,
  delegateLabel,
  revokeLabel,
  hideOnSmallScreen = false,
  forceFullText = false,
}: {
  user: ExtendedUser;
  onDelegate?: (user: ExtendedUser) => void;
  onRevoke?: (user: ExtendedUser) => void;
  onRequest?: (user: ExtendedUser) => void;
  availableAction?: DelegationAction;
  isLoading?: boolean;
  delegateLabel?: string;
  revokeLabel?: string;
  /** Hide the inline action entirely on small screens (caller provides a modal fallback). */
  hideOnSmallScreen?: boolean;
  /** Always render the button label, even on small screens (e.g. inside a modal). */
  forceFullText?: boolean;
}) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const showLabel = forceFullText || !isSmall;

  if (!availableAction) {
    return null;
  }
  // On small screens the inline control is hidden; the caller shows a modal
  // with a clearly labelled action instead.
  if (hideOnSmallScreen && isSmall) {
    return null;
  }
  if (isLoading) {
    return (
      <DsButton
        variant='tertiary'
        data-size='md'
        loading
      >
        {!isSmall && (
          <DsSkeleton
            variant='text'
            width='20'
            aria-label={t('common.loading')}
          />
        )}
      </DsButton>
    );
  }
  return (
    <>
      {availableAction === DelegationAction.DELEGATE && onDelegate && !user.isInherited && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onDelegate(user)}
          aria-label={t('common.give_poa')}
        >
          <PlusCircleIcon aria-hidden='true' />
          {showLabel && (delegateLabel ?? t('common.give_poa'))}
        </DsButton>
      )}
      {availableAction === DelegationAction.REQUEST && onRequest && !user.isInherited && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRequest(user)}
          aria-label={t('common.request_poa')}
        >
          <PlusCircleIcon aria-hidden='true' />
          {showLabel && t('common.request_poa')}
        </DsButton>
      )}
      {availableAction === DelegationAction.REVOKE && onRevoke && !user.isInherited && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRevoke(user)}
          aria-label={revokeLabel ?? t('common.delete_poa')}
        >
          <MinusCircleIcon aria-hidden='true' />
          {showLabel && (revokeLabel ?? t('common.delete_poa'))}
        </DsButton>
      )}
    </>
  );
};
