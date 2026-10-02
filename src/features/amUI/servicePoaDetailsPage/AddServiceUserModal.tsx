import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError } from '@/resources/hooks/useActionError';
import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';
import {
  useDelegateRightsMutation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserForm } from '../common/AddUserForm/AddUserForm';
import { toAddRightHolderArgs, type Recipient } from '../common/AddUserForm/recipient';
import { SubmitErrorAlert, type SubmitError } from '../common/AddUserForm/SubmitErrorAlert';
import { RightsPicker } from '../common/RightsPicker/RightsPicker';
import { useDelegableRights } from '../common/RightsPicker/useDelegableRights';

/** The user as the dialog knows them: a person is only known by the last name that was typed. */
export interface AddedServiceUser {
  name: string;
  type: 'person' | 'org';
}

interface AddServiceUserButtonProps {
  /*** The service being given */
  resource?: ServiceResource;
  /*** Called once the user both exists and holds the service */
  onUserAdded: (user: AddedServiceUser) => void;
}

/**
 * Adds a person or an organisation as a right holder and gives them the service in one step.
 *
 * The single rights API delegates to a party uuid, which a brand-new right holder does not have
 * yet, so submitting creates the right holder first and delegates with the uuid that comes back.
 * The actions are picked alongside the recipient because neither the rights meta nor the delegation
 * check depends on who the recipient is.
 */
export const AddServiceUserButton = ({ resource, onUserAdded }: AddServiceUserButtonProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();
  const resourceId = resource?.identifier ?? '';
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  // Held across both requests: between them neither mutation reports itself as loading.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addRightHolder] = useAddRightHolderMutation();
  const [delegateRights] = useDelegateRightsMutation();

  // The page hides this button when the service cannot be given to anyone, and says why there.
  const { rights, setRights, resetRights, isLoading, errorDetails } = useDelegableRights({
    resourceId,
    isEnabled: isOpen,
  });

  const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);

  const close = () => {
    setIsOpen(false);
    setSubmitError(null);
    resetRights();
    modalRef.current?.close();
  };

  const handleSubmit = async (recipient: Recipient) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      let toUuid: string;
      try {
        toUuid = await addRightHolder(toAddRightHolderArgs(recipient)).unwrap();
      } catch (error: unknown) {
        setSubmitError({ error: getActionError(error), recipientKind: recipient.kind });
        return;
      }
      try {
        await delegateRights({
          partyUuid: actingParty?.partyUuid ?? '',
          fromUuid: fromParty?.partyUuid ?? '',
          toUuid,
          resourceId,
          actionKeys,
        }).unwrap();
      } catch (error: unknown) {
        // The right holder exists by now, so nothing here can mean "no such person".
        setSubmitError({ error: getActionError(error) });
        return;
      }

      // Closed first: a snackbar raised over an open dialog is not announced, because screen readers
      // scope the live region to the dialog. A brand-new person has no name until the list reloads,
      // so the last name that was typed is what is reported, as the other add-user flows do.
      close();
      onUserAdded({
        name: recipient.kind === 'person' ? recipient.lastName : recipient.organization.name,
        type: recipient.kind,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DsButton
        variant='primary'
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
            heading={t('service_poa_details_page.add_user_modal.heading')}
            headingId={headingId}
            recipientKinds={[
              { type: 'person', submitLabel: t('common.give_poa') },
              { type: 'org', submitLabel: t('common.give_poa') },
            ]}
            isSubmitDisabled={
              !actingParty?.partyUuid ||
              !fromParty?.partyUuid ||
              actionKeys.length === 0 ||
              isLoading ||
              !!errorDetails
            }
            onKindChange={() => setSubmitError(null)}
            isSubmitting={isSubmitting}
            onSubmit={(recipient) => void handleSubmit(recipient)}
          >
            <RightsPicker
              heading={t('service_poa_details_page.add_user_modal.user_will_receive')}
              rights={rights}
              setRights={setRights}
              accessToAllLabel={t('delegation_modal.actions.access_to_all')}
              actionDescription={t('delegation_modal.actions.action_description')}
              isLoading={isLoading}
              errorDetails={errorDetails}
              errorContext={`resource: ${resourceId}`}
            />
            <SubmitErrorAlert submitError={submitError} />
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};
