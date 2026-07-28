import { type ReactNode, type Ref, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { Button, DsDialog, DsHeading } from '@altinn/altinn-components';
import cn from 'classnames';

import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';

import { RestoreFocusFallback, RestoreFocusProvider, type RestoreFocus } from '../RestoreFocus';

import classes from './TwoStepDialog.module.css';

export interface TwoStepDialogProps {
  /**
   * The static header shown across both the primary and the detail view. Accepts a node so callers
   * can pass a `<Trans>`-based title with markup (e.g. a bold recipient name).
   */
  title: ReactNode;
  /** Whether the detail (secondary) view is active. Controls the back button. */
  isDetailView: boolean;
  /** Called when the back button is pressed to return from the detail view to the primary view. */
  onBack: () => void;
  /** Called when the dialog is closed. */
  onClose?: () => void;
  /**
   * The focus controller for this dialog. Created by the caller via `useRestoreFocus` so it can also
   * request focus (e.g. back to the originating row) from its own `onBack`.
   */
  restoreFocus: RestoreFocus;
  /**
   * Optional trigger element (a `DsDialog.Trigger`). When provided the dialog is opened declaratively
   * via a trigger context; otherwise the dialog is controlled imperatively through the `ref` prop.
   */
  trigger?: ReactNode;
  /** Extra class names merged onto the dialog element. */
  className?: string;
  /** Ref to the underlying dialog element, for imperative `showModal()` / `close()`. */
  ref?: Ref<HTMLDialogElement>;
  'aria-description'?: string;
  children: ReactNode;
}

/**
 * Shared shell for the two-step (primary list/search → secondary detail) modals. It renders the
 * title as a static header that stays visible in both views, owns the back button shown in the
 * detail view, and wires up the shared close button and focus-restore plumbing. The caller supplies
 * the view content as `children` and switches between primary and detail itself.
 */
export const TwoStepDialog = ({
  title,
  isDetailView,
  onBack,
  onClose,
  restoreFocus,
  trigger,
  className,
  ref,
  children,
  'aria-description': ariaDescription,
}: TwoStepDialogProps) => {
  const { t } = useTranslation();
  const backButtonRef = useAutoFocusRef<HTMLButtonElement>();
  const headingId = useId();

  const dialog = (
    <DsDialog
      ref={ref}
      className={cn(classes.modalDialog, className)}
      closedby='any'
      closeButton={t('common.close')}
      onClose={onClose}
      aria-labelledby={headingId}
      aria-description={ariaDescription}
    >
      <DsDialog.Block>
        <DsHeading
          id={headingId}
          level={1}
          data-size='xs'
        >
          {title}
        </DsHeading>
      </DsDialog.Block>
      <DsDialog.Block>
        {isDetailView && (
          <Button
            ref={backButtonRef}
            variant='tertiary'
            data-color='neutral'
            onClick={onBack}
            className={classes.backButton}
          >
            <ArrowLeftIcon aria-hidden='true' />
            {t('common.back')}
          </Button>
        )}
        <RestoreFocusFallback>{children}</RestoreFocusFallback>
      </DsDialog.Block>
    </DsDialog>
  );

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      {trigger ? (
        <DsDialog.TriggerContext>
          {trigger}
          {dialog}
        </DsDialog.TriggerContext>
      ) : (
        dialog
      )}
    </RestoreFocusProvider>
  );
};
