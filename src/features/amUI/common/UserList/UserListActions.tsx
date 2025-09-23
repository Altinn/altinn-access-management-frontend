import { DsButton, DsSkeleton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { User } from '@/rtk/features/userInfoApi';

export const UserListActions = ({
  user,
  onDelegate,
  onRevoke,
  onRequest,
  availableAction,
  isLoading,
}: {
  user: User;
  onDelegate?: (user: User) => void;
  onRevoke?: (user: User) => void;
  onRequest?: (user: User) => void;
  availableAction?: DelegationAction;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation();

  if (!availableAction || availableAction.length === 0) {
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
        />
      </DsButton>
    );
  }
  return (
    <>
      {availableAction.includes(DelegationAction.DELEGATE) && onDelegate && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onDelegate(user)}
        >
          <PlusCircleIcon /> {t('common.give_poa')}
        </DsButton>
      )}
      {availableAction.includes(DelegationAction.REQUEST) && onRequest && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRequest(user)}
        >
          <PlusCircleIcon /> {t('common.request_poa')}
        </DsButton>
      )}
      {availableAction.includes(DelegationAction.REVOKE) && onRevoke && (
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
