import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { AmTabs } from '../AmTabs/AmTabs';
import { NewUserAlert } from '../RecipientFields/NewUserAlert';
import { OrgLookupFields } from '../RecipientFields/OrgLookupFields';
import { PersonFields } from '../RecipientFields/PersonFields';

import type { OrgRecipientOption, Recipient, RecipientKind, RecipientOption } from './recipient';
import { useRecipientForm } from './useRecipientForm';
import classes from './AddUserDialog.module.css';

const TAB_LABEL: Record<RecipientKind, string> = {
  person: 'new_user_modal.person',
  org: 'new_user_modal.organization',
};

export interface AddUserDialogProps {
  /**
   * Which recipients this dialog can add, in tab order. The first is selected, and a single kind
   * renders no tabs at all. Each carries its own submit label, so a kind cannot be offered without
   * one or labelled without being offered.
   */
  recipientKinds: readonly RecipientOption[];
  /*** Label of the button that opens the dialog. A PlusIcon is always rendered before it */
  triggerLabel: string;
  triggerVariant?: 'primary' | 'secondary';
  /*** The dialog heading. Rendered as level 2 and wired to aria-labelledby */
  heading: string;
  /*** 'wide' is the 42rem form width used by the flows that also pick rights */
  width?: 'default' | 'wide';
  /**
   * Everything this flow does with the recipient: one mutation or several, cache invalidation,
   * notifying the page, navigating. Reject to keep the dialog open and show the error; resolve to
   * close it.
   */
  onSubmit: (recipient: Recipient) => Promise<void>;
  /*** ANDed with recipient validity, for flows whose payload reaches past the recipient */
  isSubmitDisabled?: boolean;
  /*** Reported on open and on close, so callers can gate queries and reset their own payload */
  onOpenChange?: (isOpen: boolean) => void;
  /*** Extra payload UI, rendered between the recipient fields and the submit button */
  children?: React.ReactNode;
}

/**
 * The dialog shared by every "add a new user" flow: the trigger button, the dialog, the heading,
 * the recipient tabs and fields, the submit error and the one submit button.
 *
 * The form is unmounted while the dialog is closed, so reopening gives a clean form and no flow has
 * to reset its own state. Note that jsdom's mocked close() does not dispatch a close event, so
 * isOpen is tracked in React state rather than read off the dialog element.
 */
export const AddUserDialog = ({
  recipientKinds,
  triggerLabel,
  triggerVariant = 'secondary',
  heading,
  width = 'default',
  onSubmit,
  isSubmitDisabled,
  onOpenChange,
  children,
}: AddUserDialogProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);
    // Only the transition matters; a new callback identity should not re-announce it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      <DsButton
        variant={triggerVariant}
        onClick={() => {
          setIsOpen(true);
          modalRef.current?.showModal();
        }}
      >
        <PlusIcon aria-hidden='true' />
        {triggerLabel}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={headingId}
        className={width === 'wide' ? classes.wide : undefined}
        onClose={() => setIsOpen(false)}
      >
        <DsHeading
          data-size='xs'
          level={2}
          className={classes.heading}
          id={headingId}
        >
          {heading}
        </DsHeading>
        {isOpen && (
          <AddUserForm
            recipientKinds={recipientKinds}
            onSubmit={onSubmit}
            isSubmitDisabled={isSubmitDisabled}
            close={() => {
              setIsOpen(false);
              modalRef.current?.close();
            }}
          >
            {children}
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};

type AddUserFormProps = Omit<AddUserDialogProps, 'triggerLabel' | 'triggerVariant' | 'heading'> & {
  close: () => void;
};

const AddUserForm = ({
  recipientKinds,
  onSubmit,
  isSubmitDisabled,
  children,
  close,
}: AddUserFormProps) => {
  const { t } = useTranslation();
  const orgOption = recipientKinds.find(
    (option): option is OrgRecipientOption => option.type === 'org',
  );
  const { recipient, person, setPerson, orgLookup, kind, setKind } = useRecipientForm({
    initialKind: recipientKinds[0].type,
    ownOrgNumber: orgOption?.ownOrgNumber,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    status: string;
    time: string;
    traceId?: string;
  } | null>(null);

  const activeOption = recipientKinds.find((option) => option.type === kind) ?? recipientKinds[0];

  const canSubmit = !!recipient && !isSubmitDisabled && !isSubmitting;

  const submit = async () => {
    if (!recipient || !canSubmit) {
      return;
    }
    setErrorDetails(null);
    setIsSubmitting(true);
    try {
      await onSubmit(recipient);
      close();
    } catch (error: unknown) {
      setErrorDetails(toErrorDetails(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldsFor = (kind: RecipientKind) => (
    <div className={classes.fields}>
      {kind === 'person' ? (
        <PersonFields
          value={person}
          onChange={setPerson}
          onSubmit={submit}
          disabled={isSubmitting}
        />
      ) : (
        <OrgLookupFields
          lookup={orgLookup}
          warning={orgLookup.isOwnOrg && orgOption?.ownOrgWarning}
          onSubmit={submit}
          disabled={isSubmitting}
        />
      )}
    </div>
  );

  return (
    <>
      <div aria-live='assertive'>
        {errorDetails && (
          <NewUserAlert
            userType={kind}
            error={errorDetails}
          />
        )}
      </div>

      {recipientKinds.length > 1 ? (
        <AmTabs
          value={kind}
          onChange={(value) => {
            setKind(value as RecipientKind);
            setErrorDetails(null);
          }}
        >
          <AmTabs.List>
            {recipientKinds.map((option) => (
              <AmTabs.Tab
                key={option.type}
                value={option.type}
                label={t(TAB_LABEL[option.type])}
              />
            ))}
          </AmTabs.List>
          {recipientKinds.map((option) => (
            <AmTabs.Panel
              key={option.type}
              value={option.type}
            >
              {fieldsFor(option.type)}
            </AmTabs.Panel>
          ))}
        </AmTabs>
      ) : (
        fieldsFor(recipientKinds[0].type)
      )}

      {children}

      <DsButton
        className={classes.submit}
        onClick={submit}
        disabled={!canSubmit}
        loading={isSubmitting}
      >
        {activeOption.submitLabel}
      </DsButton>
    </>
  );
};

/**
 * Some mutations reduce their error to a bare status in transformErrorResponse, so an error can
 * arrive as a string or a number rather than something createErrorDetails understands.
 */
const toErrorDetails = (error: unknown): { status: string; time: string; traceId?: string } => {
  if (typeof error === 'string' || typeof error === 'number') {
    return { status: String(error), time: new Date().toISOString() };
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const { status, data } = error as { status: unknown; data?: unknown };
    return {
      status: String(status),
      time: typeof data === 'string' ? data : new Date().toISOString(),
      traceId: (data as { traceId?: string })?.traceId,
    };
  }
  return { status: '500', time: new Date().toISOString() };
};
