import { Button, DsSpinner } from '@altinn/altinn-components';
import { ExclamationmarkTriangleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import classes from './AccessPackageList.module.css';
import { DelegationAction } from '../DelegationModal/EditModal';

interface DelegateAccessPackageActionControlsProps {
  isLoading: boolean;
  availableActions?: DelegationAction[];
  onDelegate: () => void;
  onRequest: () => void;
  canDelegate: boolean;
  disabled?: boolean;
}

export const DelegateAccessPackageActionControl = ({
  isLoading,
  availableActions,
  canDelegate,
  onRequest,
  onDelegate,
  disabled = false,
}: DelegateAccessPackageActionControlsProps) => {
  const { t } = useTranslation();
  const displayLimitedPreviewLaunch = window.featureFlags.displayLimitedPreviewLaunch;

  if (isLoading) {
    return (
      <DsSpinner
        data-size='xs'
        aria-hidden='true'
      />
    );
  }

  if (availableActions?.includes(DelegationAction.DELEGATE)) {
    if (canDelegate === false) {
      return (
        <ExclamationmarkTriangleIcon
          title={t('delegation_modal.delegation_check_not_delegable')}
          aria-hidden='true'
          className={classes.warningIcon}
        />
      );
    }
    return (
      <Button
        icon={PlusCircleIcon}
        variant='text'
        size='sm'
        onClick={onDelegate}
        disabled={disabled}
      >
        {t('common.give_poa')}
      </Button>
    );
  }
  if (availableActions?.includes(DelegationAction.REQUEST) && !displayLimitedPreviewLaunch) {
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
  return null;
};
