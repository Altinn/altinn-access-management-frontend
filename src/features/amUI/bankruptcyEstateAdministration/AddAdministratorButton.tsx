import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';
import { useAddAdministratorMutation } from '@/rtk/features/bankruptcyEstateApi';

import { AddUserForm } from '../common/AddUserForm/AddUserForm';
import type { Recipient } from '../common/AddUserForm/recipient';

import { AddAdministratorErrorAlert } from './AddAdministratorErrorAlert';

export const AddAdministratorButton = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<ActionError | null>(null);
  const [addAdministrator, { isLoading: isSubmitting }] = useAddAdministratorMutation();

  const close = () => {
    setIsOpen(false);
    setError(null);
    modalRef.current?.close();
  };

  const handleAddAdministrator = async (recipient: Recipient) => {
    if (recipient.kind !== 'person') {
      return;
    }
    setError(null);
    try {
      await addAdministrator({
        personIdentifier: recipient.personIdentifier,
        lastName: recipient.lastName,
      }).unwrap();
    } catch (e: unknown) {
      setError(getActionError(e));
      return;
    }
    close();
  };

  return (
    <>
      <DsButton
        variant='primary'
        data-color='company'
        onClick={() => {
          setIsOpen(true);
          modalRef.current?.showModal();
        }}
      >
        <PlusIcon aria-hidden='true' />
        {t('bankruptcy_estate_administration_page.add_administrator_button')}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={headingId}
        onClose={close}
      >
        {isOpen && (
          <AddUserForm
            heading={t('bankruptcy_estate_administration_page.add_administrator_heading')}
            headingId={headingId}
            description={t('bankruptcy_estate_administration_page.add_administrator_description')}
            recipientKinds={[{ type: 'person', submitLabel: t('common.give_poa') }]}
            isSubmitting={isSubmitting}
            onSubmit={(recipient) => void handleAddAdministrator(recipient)}
          >
            <AddAdministratorErrorAlert error={error} />
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};
