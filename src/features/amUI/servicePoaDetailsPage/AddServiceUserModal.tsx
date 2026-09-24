import React, { useId, useRef, useState } from 'react';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsTextfield,
  ListItem,
} from '@altinn/altinn-components';
import { CheckmarkCircleIcon, PlusIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';
import { useGetOrganizationQuery, type Organization } from '@/rtk/features/lookupApi';
import {
  useDelegateRightsMutation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { formatOrgNr, isSubUnitByType } from '@/resources/utils/reporteeUtils';

import { AmTabs } from '../common/AmTabs/AmTabs';
import { ResourceAlert } from '../common/DelegationModal/SingleRights/ResourceAlert';
import { RightChips } from '../common/DelegationModal/SingleRights/RightChips';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getPersonIdentifierErrorKey } from '../common/personIdentifierUtils';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { NewUserAlert } from '../users/NewUserModal/NewUserAlert';

import { getRightsSummaryTitle, useServiceRights } from './useServiceRights';
import classes from './AddServiceUserModal.module.css';

/** The user as the dialog knows them: a person is only known by the last name that was typed. */
export interface AddedServiceUser {
  name: string;
  type: 'person' | 'org';
}

interface AddServiceUserButtonProps {
  resource?: ServiceResource;
  onUserAdded: (user: AddedServiceUser) => void;
}

export const AddServiceUserButton = ({ resource, onUserAdded }: AddServiceUserButtonProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

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
      <AddServiceUserModal
        modalRef={modalRef}
        isOpen={isOpen}
        resource={resource}
        onUserAdded={onUserAdded}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

interface AddServiceUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isOpen: boolean;
  resource?: ServiceResource;
  /** Called once the user both exists and holds the service, after the dialog has closed. */
  onUserAdded: (user: AddedServiceUser) => void;
  onClose: () => void;
}

/**
 * Adds a person or an organisation as a right holder and gives them the service in one step.
 *
 * The single rights API delegates to a party uuid, which a brand-new right holder does not have
 * yet, so submitting creates the right holder first and delegates with the uuid that comes back.
 * The actions are picked here rather than in a follow-up dialog because neither the rights meta nor
 * the delegation check depends on who the recipient is.
 */
const AddServiceUserModal = ({
  modalRef,
  isOpen,
  resource,
  onUserAdded,
  onClose,
}: AddServiceUserModalProps) => {
  const { t } = useTranslation();
  const headingId = useId();
  const { actingParty, fromParty } = usePartyRepresentation();
  const resourceId = resource?.identifier ?? '';

  const [addRightHolder] = useAddRightHolderMutation();
  const [delegateRights] = useDelegateRightsMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userType, setUserType] = useState<'person' | 'org'>('person');
  const [personIdentifier, setPersonIdentifier] = useState('');
  const [lastName, setLastName] = useState('');
  const [personIdentifierError, setPersonIdentifierError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState('');
  const [orgNumber, setOrgNumber] = useState('');
  const [rightsExpanded, setRightsExpanded] = useState(false);
  // Which step failed decides how it is reported: only the right holder step can mean "we could
  // not find that person or organisation".
  const [submitError, setSubmitError] = useState<{
    step: 'addRightHolder' | 'delegate';
    details: { status: string; time: string; traceId?: string };
  } | null>(null);

  const {
    rights,
    setRights,
    resetRights,
    isLoading: isRightsLoading,
    errorDetails: rightsErrorDetails,
  } = useServiceRights({ resourceId, isEnabled: isOpen });

  const {
    data: orgData,
    isFetching: isOrgFetching,
    error: getOrgError,
    isError: isGetOrgError,
  } = useGetOrganizationQuery(orgNumber, { skip: orgNumber.length !== 9 });

  const resetForm = () => {
    setUserType('person');
    setPersonIdentifier('');
    setLastName('');
    setPersonIdentifierError(null);
    setLastNameError('');
    setOrgNumber('');
    setRightsExpanded(false);
    setSubmitError(null);
    resetRights();
  };

  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.rightName);
  const selectedRights = rights.filter((r) => r.checked).map((r) => r.rightKey);

  // Same shape as the other resource modals, minus their `hasAccess` term: the user being added is
  // new, so there is never an existing delegation to fall back on. Without this the picker would
  // render empty (RightChips drops every non-delegable action) above a button that can never be
  // pressed, and the reason would be buried in the collapsed section.
  const displayResourceAlert =
    !!rightsErrorDetails ||
    resource?.delegable === false ||
    (rights.length > 0 && !rights.some((r) => r.delegable === true));

  const personIdentifierValidation = getPersonIdentifierErrorKey(personIdentifier);
  const isPersonValid =
    personIdentifier.trim().length > 0 &&
    personIdentifierValidation === null &&
    lastName.trim().length >= 1;
  const isOrgValid = !!orgData?.partyUuid && orgData.orgNumber === orgNumber;

  const isFormValid =
    !!actingParty?.partyUuid &&
    !!fromParty?.partyUuid &&
    (userType === 'person' ? isPersonValid : isOrgValid) &&
    selectedRights.length > 0 &&
    !isRightsLoading &&
    !displayResourceAlert &&
    !isSubmitting;

  // delegateRights' transformErrorResponse reduces the error to a bare status, so it can arrive as
  // a string or a number rather than something createErrorDetails understands.
  const toErrorDetails = (error: unknown) => {
    const unknownFailure = { status: '500', time: new Date().toISOString() };
    if (typeof error === 'string' || typeof error === 'number') {
      return { status: String(error), time: new Date().toISOString() };
    }
    if (error && typeof error === 'object' && 'status' in error) {
      return createErrorDetails(error as FetchBaseQueryError) ?? unknownFailure;
    }
    return unknownFailure;
  };

  const handleSubmit = async () => {
    if (!isFormValid || !actingParty || !fromParty) return;
    setSubmitError(null);
    setIsSubmitting(true);

    let toUuid: string;
    try {
      toUuid = await addRightHolder(
        userType === 'person'
          ? {
              personInput: {
                personIdentifier: personIdentifier.trim(),
                lastName: lastName.trim(),
              },
            }
          : { partyUuidToBeAdded: (orgData as Organization).partyUuid },
      ).unwrap();
    } catch (error: unknown) {
      setSubmitError({ step: 'addRightHolder', details: toErrorDetails(error) });
      setIsSubmitting(false);
      return;
    }

    try {
      await delegateRights({
        partyUuid: actingParty.partyUuid,
        fromUuid: fromParty.partyUuid,
        toUuid,
        resourceId,
        actionKeys: selectedRights,
      }).unwrap();

      // Close first: a snackbar opened while a modal dialog is still up is not announced by screen
      // readers, which scope the live region to the dialog.
      modalRef.current?.close();
      onUserAdded({
        // A brand-new person has no name until the list reloads; the last name that was typed is
        // what the add-user flow elsewhere reports as well.
        name: userType === 'person' ? lastName.trim() : (orgData?.name ?? ''),
        type: userType,
      });
    } catch (error: unknown) {
      // The right holder exists by now, so nothing here can mean "no such person".
      setSubmitError({ step: 'delegate', details: toErrorDetails(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.repeat && isFormValid) {
      void handleSubmit();
    }
  };

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      aria-labelledby={headingId}
      className={classes.modal}
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      <div className={classes.content}>
        <DsHeading
          data-size='xs'
          level={2}
          id={headingId}
        >
          {t('service_poa_details_page.add_user_modal.heading')}
        </DsHeading>

        <div aria-live='assertive'>
          {submitError?.step === 'addRightHolder' && (
            <NewUserAlert
              userType={userType}
              error={submitError.details}
            />
          )}
          {submitError?.step === 'delegate' && (
            <DsAlert
              data-size='sm'
              data-color='danger'
            >
              <DsParagraph data-size='sm'>{t('common.general_error_paragraph')}</DsParagraph>
              <TechnicalErrorParagraphs
                status={submitError.details.status}
                time={submitError.details.time}
                traceId={submitError.details.traceId}
                size='sm'
              />
            </DsAlert>
          )}
        </div>

        <AmTabs
          value={userType}
          onChange={(value) => {
            setUserType(value as 'person' | 'org');
            setSubmitError(null);
          }}
        >
          <AmTabs.List>
            <AmTabs.Tab
              value='person'
              label={t('new_user_modal.person')}
            />
            <AmTabs.Tab
              value='org'
              label={t('new_user_modal.organization')}
            />
          </AmTabs.List>
          <AmTabs.Panel value='person'>
            <div className={classes.fields}>
              <DsTextfield
                className={classes.textField}
                label={t('new_user_modal.person_identifier')}
                data-size='sm'
                value={personIdentifier}
                onChange={(e) => setPersonIdentifier(e.target.value)}
                onBlur={() =>
                  setPersonIdentifierError(
                    personIdentifierValidation ? t(personIdentifierValidation) : null,
                  )
                }
                error={personIdentifierError}
                disabled={isSubmitting}
                onKeyDown={submitOnEnter}
              />
              <DsTextfield
                className={classes.textField}
                label={t('common.last_name')}
                data-size='sm'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() =>
                  setLastNameError(
                    lastName.trim().length >= 1 ? '' : t('new_user_modal.last_name_format_error'),
                  )
                }
                error={lastNameError}
                disabled={isSubmitting}
                onKeyDown={submitOnEnter}
              />
            </div>
          </AmTabs.Panel>
          <AmTabs.Panel value='org'>
            <div className={classes.fields}>
              <DsTextfield
                className={classes.textField}
                label={t('common.org_number')}
                data-size='sm'
                value={orgNumber}
                onChange={(e) => setOrgNumber(e.target.value.replace(/ /g, ''))}
                disabled={isSubmitting}
                onKeyDown={submitOnEnter}
              />
              <div aria-live='polite'>
                {isGetOrgError && (
                  <NewUserAlert
                    userType='org'
                    error={createErrorDetails(getOrgError)}
                  />
                )}
                {!isGetOrgError && !isOrgFetching && isOrgValid && (
                  <div className={classes.searchResult}>
                    <DsHeading
                      data-size='2xs'
                      level={3}
                    >
                      {t('new_user_modal.org_search_result_label')}
                    </DsHeading>
                    <DsParagraph>
                      <strong>{orgData?.name}</strong>
                    </DsParagraph>
                    <DsParagraph data-size='sm'>
                      {t('common.org_nr')} {formatOrgNr(orgData?.orgNumber ?? '')}
                      {isSubUnitByType(orgData?.unitType) && ' - ' + t('common.subunit')}
                    </DsParagraph>
                  </div>
                )}
              </div>
            </div>
          </AmTabs.Panel>
        </AmTabs>

        <div className={classes.rightsSection}>
          {resource && displayResourceAlert ? (
            <ResourceAlert
              error={rightsErrorDetails}
              rightReasons={rights.map((r) => r.delegationReason)}
              resource={resource}
            />
          ) : (
            <>
              <DsHeading
                level={3}
                data-size='xs'
              >
                {t('service_poa_details_page.add_user_modal.user_will_receive')}
              </DsHeading>

              <ListItem
                loading={isRightsLoading}
                icon={CheckmarkCircleIcon}
                collapsible
                size='md'
                title={getRightsSummaryTitle(rights, t)}
                onClick={() => setRightsExpanded(!rightsExpanded)}
                expanded={rightsExpanded}
                as='button'
                containerAs='div'
                border='solid'
                shadow='none'
              >
                <div className={classes.rightExpandableContent}>
                  <DsParagraph>{t('delegation_modal.actions.action_description')}</DsParagraph>
                  <div className={classes.rightChips}>
                    <RightChips
                      rights={rights}
                      setRights={setRights}
                      editable
                    />
                  </div>
                  {undelegableActions.length > 0 && (
                    <div className={classes.undelegableSection}>
                      <DsHeading
                        level={4}
                        data-size='2xs'
                      >
                        {t('delegation_modal.actions.cannot_give_header')}
                      </DsHeading>
                      <div>{undelegableActions.join(', ')}</div>
                    </div>
                  )}
                </div>
              </ListItem>
            </>
          )}
        </div>

        <div className={classes.buttonRow}>
          <DsButton
            onClick={() => void handleSubmit()}
            disabled={!isFormValid}
            loading={isSubmitting}
          >
            {t('common.give_poa')}
          </DsButton>
        </div>
      </div>
    </DsDialog>
  );
};
