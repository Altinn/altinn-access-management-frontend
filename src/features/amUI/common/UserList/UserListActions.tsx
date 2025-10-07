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
}: {
  user: ExtendedUser;
  onDelegate?: (user: ExtendedUser) => void;
  onRevoke?: (user: ExtendedUser) => void;
  onRequest?: (user: ExtendedUser) => void;
  availableAction?: DelegationAction;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  if (!availableAction) {
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
          <PlusCircleIcon />
          {!isSmall && t('common.give_poa')}
        </DsButton>
      )}
      {availableAction === DelegationAction.REQUEST && onRequest && !user.isInherited && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRequest(user)}
          aria-label={t('common.request_poa')}
        >
          <PlusCircleIcon />
          {!isSmall && t('common.request_poa')}
        </DsButton>
      )}
      {availableAction === DelegationAction.REVOKE && onRevoke && !user.isInherited && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRevoke(user)}
          aria-label={t('common.delete_poa')}
        >
          <MinusCircleIcon />
          {!isSmall && t('common.delete_poa')}
        </DsButton>
      )}
    </>
  );
};
