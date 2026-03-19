import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { useDispatch } from 'react-redux';

import { useDelegateInstanceRightsMutation } from '@/rtk/features/instanceApi';
import { connectionApi } from '@/rtk/features/connectionApi';

import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { RightChips } from '../common/DelegationModal/SingleRights/RightChips';
import { getPersonIdentifierErrorKey } from '../common/personIdentifierUtils';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { getRightsSummaryTitle, useInstanceRights } from './useInstanceRights';

import classes from './AddUserModal.module.css';

export interface AddUserModalDraft {
  personIdentifier: string;
  lastName: string;
  resourceId: string;
  instanceUrn: string;
  selectedRights: string[];
}

interface AddUserButtonProps {
  resourceId: string;
  instanceUrn: string;
  isLarge?: boolean;
}

interface AddUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isOpen: boolean;
  resourceId: string;
  instanceUrn: string;
  onClose: () => void;
}

export const AddUserButton = ({ resourceId, instanceUrn, isLarge }: AddUserButtonProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <DsButton
        variant={isLarge ? 'primary' : 'secondary'}
        onClick={() => {
          setIsOpen(true);
          modalRef.current?.showModal();
        }}
        className={isLarge ? classes.largeButton : undefined}
      >
        <PlusIcon aria-label={t('common.add')} />
        {isLarge ? t('new_user_modal.trigger_button_large') : t('new_user_modal.trigger_button')}
      </DsButton>
      <AddUserModal
        modalRef={modalRef}
        isOpen={isOpen}
        resourceId={resourceId}
        instanceUrn={instanceUrn}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

const AddUserModal = ({
  modalRef,
  isOpen,
  resourceId,
  instanceUrn,
  onClose,
}: AddUserModalProps) => {
  const { t } = useTranslation();
  const headingId = useId();
  const { actingParty } = usePartyRepresentation();
  const dispatch = useDispatch();
  const [delegateInstanceRights, { isLoading: isSubmitting, error: submitError }] =
    useDelegateInstanceRightsMutation();

  const [personIdentifier, setPersonIdentifier] = useState('');
  const [lastName, setLastName] = useState('');
  const [personIdentifierFormatErrorKey, setPersonIdentifierFormatErrorKey] = useState<
    string | null
  >(null);

  const [lastNameFormatError, setLastNameFormatError] = useState('');
  const [rightsExpanded, setRightsExpanded] = useState(false);
  const [submitErrorDetails, setSubmitErrorDetails] = useState<{
    status: string;
    time: string;
    traceId?: string;
  } | null>(null);

  const {
    rights,
    setRights,
    resetRights,
    isLoading: isRightsLoading,
    errorDetails: rightsErrorDetails,
  } = useInstanceRights({ resourceId, instanceUrn, isOpen });

  const resetForm = () => {
    setPersonIdentifier('');
    setLastName('');
    setPersonIdentifierFormatErrorKey(null);
    setLastNameFormatError('');
    resetRights();
    setRightsExpanded(false);
    setSubmitErrorDetails(null);
  };

  useEffect(() => {
    if (submitError) {
      const details = createErrorDetails(submitError);
      setSubmitErrorDetails(
        details ?? {
          status: '500',
          time: new Date().toISOString(),
        },
      );
    }
  }, [submitError]);

  const undelegableActions = useMemo(
    () => rights.filter((r) => !r.delegable).map((r) => r.rightName),
    [rights],
  );

  const personIdentifierErrorKey = getPersonIdentifierErrorKey(personIdentifier);
  const selectedRights = rights.filter((r) => r.checked).map((r) => r.rightKey);
  const isLastNameValid = lastName.trim().length >= 1;
  const isFormValid =
    !!actingParty?.partyUuid &&
    personIdentifier.trim().length > 0 &&
    personIdentifierErrorKey === null &&
    isLastNameValid &&
    selectedRights.length > 0 &&
    !isRightsLoading &&
    !rightsErrorDetails;

  const handleComplete = async () => {
    if (!actingParty?.partyUuid) {
      return;
    }

    const draft = {
      personIdentifier: personIdentifier.trim(),
      lastName: lastName.trim(),
      resourceId,
      instanceUrn,
      selectedRights,
    };

    setSubmitErrorDetails(null);

    try {
      await delegateInstanceRights({
        party: actingParty.partyUuid,
        resource: draft.resourceId,
        instance: draft.instanceUrn,
        input: {
          to: {
            personIdentifier: draft.personIdentifier,
            lastName: draft.lastName,
          },
          directRightKeys: draft.selectedRights,
        },
      }).unwrap();

      dispatch(connectionApi.util.invalidateTags(['Connections']));
      modalRef.current?.close();
    } catch {
      // Error state is handled through RTK Query mutation state.
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
          className={classes.heading}
        >
          {t('new_user_modal.trigger_button_large')}
        </DsHeading>

        {submitErrorDetails && (
          <DsAlert data-color='danger'>
            <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
            <TechnicalErrorParagraphs
              status={submitErrorDetails.status}
              time={submitErrorDetails.time}
              traceId={submitErrorDetails.traceId}
            />
          </DsAlert>
        )}

        <div className={classes.fields}>
          <DsTextfield
            className={classes.textField}
            label={t('new_user_modal.person_identifier')}
            data-size='sm'
            value={personIdentifier}
            onChange={(e) => setPersonIdentifier(e.target.value)}
            onBlur={() => setPersonIdentifierFormatErrorKey(personIdentifierErrorKey)}
            error={personIdentifierFormatErrorKey ? t(personIdentifierFormatErrorKey) : null}
            disabled={isSubmitting}
          />
          <DsTextfield
            className={classes.textField}
            label={t('common.last_name')}
            data-size='sm'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() =>
              setLastNameFormatError(
                isLastNameValid ? '' : t('new_user_modal.last_name_format_error'),
              )
            }
            error={lastNameFormatError}
            disabled={isSubmitting}
          />
        </div>

        <div className={classes.rightsSection}>
          <DsHeading
            level={3}
            data-size='xs'
          >
            {t('instance_detail_page.add_user_modal.user_will_receive')}
          </DsHeading>

          {rightsErrorDetails ? (
            <DsAlert data-color='danger'>
              <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
              <TechnicalErrorParagraphs
                status={rightsErrorDetails.status}
                time={rightsErrorDetails.time}
                traceId={rightsErrorDetails.traceId}
                additionalContext={`resource: ${resourceId} - instance: ${instanceUrn}`}
              />
            </DsAlert>
          ) : (
            <ListItem
              loading={isRightsLoading}
              icon={CheckmarkCircleIcon}
              collapsible={true}
              size='md'
              title={getRightsSummaryTitle(rights, t)}
              onClick={() => setRightsExpanded(!rightsExpanded)}
              expanded={rightsExpanded}
              as='button'
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
                      level={5}
                      data-size='2xs'
                      className={classes.undelegableHeader}
                    >
                      {t('delegation_modal.actions.cannot_give_header')}
                    </DsHeading>
                    <div className={classes.undelegableActions}>
                      {undelegableActions.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </ListItem>
          )}
        </div>

        <div className={classes.buttonRow}>
          <DsButton
            onClick={() => {
              void handleComplete();
            }}
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
