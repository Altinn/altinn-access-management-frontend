import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError } from '@/resources/hooks/useActionError';
import { useAddMaskinportenSupplierMutation } from '@/rtk/features/maskinportenApi';
import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserForm } from '../common/AddUserForm/AddUserForm';
import type { Recipient } from '../common/AddUserForm/recipient';
import { SubmitErrorAlert, type SubmitError } from '../common/AddUserForm/SubmitErrorAlert';

interface AddSupplierButtonProps {
  party: string;
  onComplete: (user: PartyEntity) => void;
}

export const AddSupplierButton = ({ party, onComplete }: AddSupplierButtonProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [addSupplier, { isLoading: isSubmitting }] = useAddMaskinportenSupplierMutation();

  const close = () => {
    setIsOpen(false);
    setSubmitError(null);
    modalRef.current?.close();
  };

  const handleAddSupplier = async (recipient: Recipient) => {
    if (recipient.kind !== 'org') {
      return;
    }
    setSubmitError(null);
    try {
      await addSupplier({
        party,
        supplier: recipient.organization.organizationIdentifier,
      }).unwrap();
    } catch (error: unknown) {
      setSubmitError({ error: getActionError(error), recipientKind: 'org' });
      return;
    }
    close();
    onComplete({
      name: recipient.organization.name,
      type: PartyType.Organization,
      isDeleted: false,
      id: recipient.organization.id,
      organizationIdentifier: recipient.organization.organizationIdentifier,
    });
  };

  return (
    <>
      <DsButton
        variant='secondary'
        onClick={() => {
          setIsOpen(true);
          modalRef.current?.showModal();
        }}
      >
        <PlusIcon aria-hidden='true' />
        {t('maskinporten_page.add_supplier_button')}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={headingId}
        onClose={close}
      >
        {isOpen && (
          <AddUserForm
            heading={t('maskinporten_page.add_supplier_button')}
            headingId={headingId}
            recipientKinds={[
              {
                type: 'org',
                submitLabel: t('new_user_modal.add_org_button'),
                ownOrgNumber: actingParty?.organizationIdentifier ?? undefined,
                ownOrgWarning: (
                  <DsAlert
                    data-size='sm'
                    data-color='warning'
                  >
                    <DsHeading
                      data-size='xs'
                      level={3}
                    >
                      {t('maskinporten_page.own_org_number_warning')}
                    </DsHeading>
                    <DsParagraph data-size='sm'>
                      {t('maskinporten_page.own_org_number_warning_body')}
                    </DsParagraph>
                  </DsAlert>
                ),
              },
            ]}
            isSubmitting={isSubmitting}
            onSubmit={(recipient) => void handleAddSupplier(recipient)}
          >
            <SubmitErrorAlert submitError={submitError} />
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};
