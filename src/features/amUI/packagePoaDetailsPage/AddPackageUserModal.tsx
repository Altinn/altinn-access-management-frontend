import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsDialog, DsHeading } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';
import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';
import { useDelegatePackageMutation, type AccessPackage } from '@/rtk/features/accessPackageApi';
import { type Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserForm } from '../common/AddUserForm/AddUserForm';
import {
  toAddRightHolderArgs,
  type Recipient,
  type RecipientKind,
} from '../common/AddUserForm/recipient';
import { SubmitErrorAlert, type SubmitError } from '../common/AddUserForm/SubmitErrorAlert';
import { usePackageWarningDialog } from '../common/PackageWarningDialog';
import { ValidationErrorMessage } from '../common/ValidationErrorMessage';

/** The user as the dialog knows them: a person is only known by the last name that was typed. */
export interface AddedPackageUser {
  name: string;
  type: 'person' | 'org';
}

interface AddPackageUserButtonProps {
  accessPackage?: AccessPackage;
  /*** Called once the user both exists and holds the package */
  onUserAdded: (user: AddedPackageUser) => void;
}

/** A delegation refused for a reason the backend names, as opposed to a technical failure. */
interface ValidationError {
  error: ActionError;
  recipientKind: RecipientKind;
}

const recipientName = (recipient: Recipient) =>
  recipient.kind === 'person' ? recipient.lastName : recipient.organization.name;

/**
 * The package warning needs to know whether the recipient is a person or an organisation before
 * they exist as a right holder, so it is given a party that holds only that and the name.
 */
const toWarningParty = (recipient: Recipient): Party => ({
  partyId: 0,
  partyUuid: recipient.kind === 'org' ? recipient.organization.partyUuid : '',
  name: recipientName(recipient),
  partyTypeName: recipient.kind === 'person' ? PartyType.Person : PartyType.Organization,
});

/**
 * Adds a person or an organisation as a right holder and gives them the access package in one step.
 *
 * The package is delegated to a party uuid, which a brand-new right holder does not have yet, so
 * submitting creates the right holder first and delegates with the uuid that comes back. Packages
 * that need a warning are confirmed before either request, so a cancel leaves nothing half done.
 */
export const AddPackageUserButton = ({ accessPackage, onUserAdded }: AddPackageUserButtonProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  // Held across both requests: between them neither mutation reports itself as loading.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addRightHolder] = useAddRightHolderMutation();
  const [delegatePackage] = useDelegatePackageMutation();
  const { confirmPackageAction, packageWarningDialog } = usePackageWarningDialog();

  const clearErrors = () => {
    setSubmitError(null);
    setValidationError(null);
  };

  const close = () => {
    setIsOpen(false);
    clearErrors();
    modalRef.current?.close();
  };

  const addAndDelegate = async (recipient: Recipient) => {
    if (!accessPackage || !actingParty || !fromParty) return;
    clearErrors();
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
        await delegatePackage({
          to: toUuid,
          packageId: accessPackage.id,
          from: fromParty.partyUuid,
          party: actingParty.partyUuid,
        }).unwrap();
      } catch (error: unknown) {
        // The right holder exists by now, so nothing here can mean "no such person".
        const actionError = getActionError(error);
        if (actionError.details?.errorCode || actionError.details?.detail) {
          setValidationError({ error: actionError, recipientKind: recipient.kind });
        } else {
          setSubmitError({ error: actionError });
        }
        return;
      }

      // Closed first: a snackbar raised over an open dialog is not announced, because screen readers
      // scope the live region to the dialog. A brand-new person has no name until the list reloads,
      // so the last name that was typed is what is reported, as the other add-user flows do.
      close();
      onUserAdded({ name: recipientName(recipient), type: recipient.kind });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (recipient: Recipient) => {
    if (!accessPackage || !fromParty) return;
    confirmPackageAction(
      { action: 'delegate', accessPackage, fromParty, toParty: toWarningParty(recipient) },
      () => void addAndDelegate(recipient),
    );
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
            heading={t('package_poa_details_page.add_user_modal.heading')}
            headingId={headingId}
            recipientKinds={[
              { type: 'person', submitLabel: t('common.give_poa') },
              { type: 'org', submitLabel: t('common.give_poa') },
            ]}
            isSubmitDisabled={!accessPackage || !actingParty?.partyUuid || !fromParty?.partyUuid}
            onKindChange={clearErrors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          >
            <div aria-live='assertive'>
              {validationError && (
                <DsAlert
                  data-size='sm'
                  data-color='danger'
                >
                  <DsHeading
                    level={3}
                    data-size='2xs'
                  >
                    {t('delegation_modal.general_error.delegate_heading')}
                  </DsHeading>
                  <ValidationErrorMessage
                    errorCode={
                      validationError.error.details?.errorCode ??
                      validationError.error.details?.detail ??
                      ''
                    }
                    translationValues={{
                      entity_type:
                        validationError.recipientKind === 'person'
                          ? t('common.persons_lowercase')
                          : t('common.organizations_lowercase'),
                    }}
                  />
                </DsAlert>
              )}
            </div>
            <SubmitErrorAlert submitError={submitError} />
          </AddUserForm>
        )}
      </DsDialog>
      {packageWarningDialog}
    </>
  );
};
