import { DsButton, DsSkeleton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { ExtendedUser } from '@/rtk/features/userInfoApi';

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
        <DsSkeleton
          variant='text'
          width='20'
          aria-label={t('common.loading')}
        />
      </DsButton>
    );
  }
  return (
    <>
      {availableAction === DelegationAction.DELEGATE && onDelegate && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onDelegate(user)}
        >
          <PlusCircleIcon /> {t('common.give_poa')}
        </DsButton>
      )}
      {availableAction === DelegationAction.REQUEST && onRequest && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRequest(user)}
        >
          <PlusCircleIcon /> {t('common.request_poa')}
        </DsButton>
      )}
      {availableAction === DelegationAction.REVOKE && onRevoke && !user.isInherited && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRevoke(user)}
        >
          <MinusCircleIcon /> {t('common.delete_poa')}
        </DsButton>
      )}
    </>
  );
};
