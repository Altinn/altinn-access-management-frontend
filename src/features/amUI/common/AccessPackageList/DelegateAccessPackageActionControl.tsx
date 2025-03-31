import { Paragraph, Spinner } from '@digdir/designsystemet-react';
import { Button } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';

interface DelegateAccessPackageActionControlsProps {
  isLoading: boolean;
  availableActions?: DelegationAction[];
  onDelegate: () => void;
  onSelect: () => void;
  onRequest: () => void;
  canDelegate: boolean;
}

export const DelegateAccessPackageActionControl = ({
  isLoading,
  availableActions,
  canDelegate,
  onRequest,
  onSelect,
  onDelegate,
}: DelegateAccessPackageActionControlsProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Spinner
        data-size='sm'
        aria-hidden='true'
      />
    );
  }

  if (availableActions?.includes(DelegationAction.DELEGATE)) {
    if (!isLoading && canDelegate === false) {
      return (
        <Button
          data-size='xs'
          onClick={onSelect}
          variant='text'
          aria-label={t('delegation_modal.delegation_check_not_delegable')}
          size='sm'
        >
          <ExclamationmarkTriangleIcon
            aria-hidden='true'
            fontSize={'1.2rem'}
          />
        </Button>
      );
    }
    return (
      <Button
        icon={PlusCircleIcon}
        variant='text'
        size='sm'
        onClick={onDelegate}
      >
        {t('common.give_poa')}
      </Button>
    );
  }
  if (availableActions?.includes(DelegationAction.REQUEST)) {
    return (
      <Button
        icon={PlusCircleIcon}
        variant='text'
        size='sm'
        disabled
        onClick={onRequest}
      >
        {t('common.request_poa')}
      </Button>
    );
  }
};
