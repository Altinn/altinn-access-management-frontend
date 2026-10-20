import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';
import { type ReactNode } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import { useRestoreFocus } from '../RestoreFocus';
import { TwoStepDialog } from '../TwoStepDialog';

import classes from './DelegationModal.module.css';
import { useDelegationModalContext } from './DelegationModalContext';

interface DelegationDialogProps {
  title: ReactNode;
  triggerText: string;
  searchView: ReactNode;
  infoView: ReactNode;
  /** Id of the element to return focus to when navigating back from the info view */
  focusTargetId?: string;
  onClose?: () => void;
}

/** Shared frame for the delegation modals: trigger button, search view and info view */
export const DelegationDialog = ({
  title,
  triggerText,
  searchView,
  infoView,
  focusTargetId,
  onClose,
}: DelegationDialogProps) => {
  const { t } = useTranslation();
  const { infoView: isDetailView, setInfoView, reset } = useDelegationModalContext();
  const restoreFocus = useRestoreFocus();

  const onClosing = () => {
    reset();
    onClose?.();
  };

  const onBack = () => {
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    setInfoView(false);
  };

  return (
    <TwoStepDialog
      title={title}
      isDetailView={isDetailView}
      onBack={onBack}
      onClose={onClosing}
      restoreFocus={restoreFocus}
      aria-description={t('delegation_modal.aria_description')}
      trigger={
        <DsDialog.Trigger
          data-size='sm'
          variant='primary'
          className={classes.triggerButton}
        >
          <PlusIcon aria-hidden='true' />
          {triggerText}
        </DsDialog.Trigger>
      }
    >
      {isDetailView ? infoView : searchView}
    </TwoStepDialog>
  );
};
