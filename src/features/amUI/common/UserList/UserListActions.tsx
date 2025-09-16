import { Button, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

export const UserListActions = ({
  userId,
  userName,
  onDelegate,
  onRevoke,
  onRequest,
  availableAction,
}: {
  userId: string;
  userName: string;
  onDelegate?: (userId: string) => void;
  onRevoke?: (userId: string) => void;
  onRequest?: (userId: string) => void;
  availableAction?: DelegationAction;
}) => {
  const { t } = useTranslation();

  if (!availableAction || availableAction.length === 0) {
    return null;
  }

  return (
    <>
      {availableAction.includes(DelegationAction.DELEGATE) && onDelegate && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onDelegate(userId)}
        >
          <PlusCircleIcon /> {t('common.give_poa')}
        </DsButton>
      )}
      {availableAction.includes(DelegationAction.REQUEST) && onRequest && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRequest(userId)}
        >
          <PlusCircleIcon /> {t('common.request_poa')}
        </DsButton>
      )}
      {availableAction.includes(DelegationAction.REVOKE) && onRevoke && (
        <DsButton
          variant='tertiary'
          data-size='md'
          onClick={() => onRevoke(userId)}
        >
          <MinusCircleIcon /> {t('common.delete_poa')}
        </DsButton>
      )}
    </>
  );
};
