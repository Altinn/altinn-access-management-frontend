import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError } from '@/resources/hooks/useActionError';
import { useAddAgentMutation, type AssignmentDto } from '@/rtk/features/clientApi';
import { type User } from '@/rtk/features/userInfoApi';

import { AddUserForm } from '../../common/AddUserForm/AddUserForm';
import type { Recipient } from '../../common/AddUserForm/recipient';
import { SubmitErrorAlert, type SubmitError } from '../../common/AddUserForm/SubmitErrorAlert';

interface AddAgentButtonProps {
  variant: 'primary' | 'secondary';
  onComplete?: (user: User) => void;
}

export const AddAgentButton: React.FC<AddAgentButtonProps> = ({ variant, onComplete }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [addAgent, { isLoading: isSubmitting }] = useAddAgentMutation();

  const close = () => {
    setIsOpen(false);
    setSubmitError(null);
    modalRef.current?.close();
  };

  const handleAddAgent = async (recipient: Recipient) => {
    if (recipient.kind !== 'person') {
      return;
    }
    setSubmitError(null);
    let assignment: AssignmentDto;
    try {
      assignment = await addAgent({
        personInput: {
          personIdentifier: recipient.personIdentifier,
          lastName: recipient.lastName,
        },
      }).unwrap();
    } catch (error: unknown) {
      setSubmitError({ error: getActionError(error), recipientKind: 'person' });
      return;
    }
    close();
    onComplete?.({
      id: assignment.toId || assignment.id,
      name: recipient.lastName,
      type: 'person',
      children: null,
    });
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
        {t('client_administration_page.add_agent_button')}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={headingId}
        onClose={close}
      >
        {isOpen && (
          <AddUserForm
            heading={t('client_administration_page.add_agent_button')}
            headingId={headingId}
            recipientKinds={[
              { type: 'person', submitLabel: t('new_user_modal.add_person_button') },
            ]}
            isSubmitting={isSubmitting}
            onSubmit={(recipient) => void handleAddAgent(recipient)}
          >
            <SubmitErrorAlert submitError={submitError} />
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};
