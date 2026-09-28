import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError } from '@/resources/hooks/useActionError';
import { type User } from '@/rtk/features/userInfoApi';
import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';

import { AddUserForm } from '../../common/AddUserForm/AddUserForm';
import { toAddRightHolderArgs, type Recipient } from '../../common/AddUserForm/recipient';
import { SubmitErrorAlert, type SubmitError } from '../../common/AddUserForm/SubmitErrorAlert';

/**
 * NewUserButton component renders a button that, when clicked, opens a modal to add a new user.
 * @component
 */
interface NewUserButtonProps {
  variant: 'primary' | 'secondary';
  onComplete?: (user: User) => void;
}

export const NewUserButton: React.FC<NewUserButtonProps> = ({ variant, onComplete }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [addRightHolder, { isLoading: isSubmitting }] = useAddRightHolderMutation();

  const close = () => {
    setIsOpen(false);
    setSubmitError(null);
    modalRef.current?.close();
  };

  const handleSubmit = async (recipient: Recipient) => {
    setSubmitError(null);
    let toUuid: string;
    try {
      toUuid = await addRightHolder(toAddRightHolderArgs(recipient)).unwrap();
    } catch (error: unknown) {
      setSubmitError({ error: getActionError(error), recipientKind: recipient.kind });
      return;
    }
    close();
    onComplete?.(
      recipient.kind === 'person'
        ? { id: toUuid, name: recipient.lastName, type: 'person', children: null }
        : {
            id: recipient.organization.partyUuid,
            name: recipient.organization.name,
            type: 'organisasjon',
            children: null,
            organizationIdentifier: recipient.organization.orgNumber,
          },
    );
  };

  return (
    <>
      <DsButton
        variant={variant}
        onClick={() => {
          setIsOpen(true);
          modalRef.current?.showModal();
        }}
      >
        <PlusIcon aria-hidden='true' />
        {t('new_user_modal.trigger_button')}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={headingId}
        onClose={close}
      >
        {isOpen && (
          <AddUserForm
            heading={t('new_user_modal.modal_title')}
            headingId={headingId}
            recipientKinds={[
              { type: 'person', submitLabel: t('new_user_modal.add_person_button') },
              { type: 'org', submitLabel: t('new_user_modal.add_org_button') },
            ]}
            onKindChange={() => setSubmitError(null)}
            isSubmitting={isSubmitting}
            onSubmit={(recipient) => void handleSubmit(recipient)}
          >
            <SubmitErrorAlert submitError={submitError} />
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};
