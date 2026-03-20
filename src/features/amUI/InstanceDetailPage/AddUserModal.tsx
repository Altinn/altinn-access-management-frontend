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
  const [delegateInstanceRights, { isLoading: isSubmitting }] = useDelegateInstanceRightsMutation();

  const [personIdentifier, setPersonIdentifier] = useState('');
  const [lastName, setLastName] = useState('');
  const [personIdentifierError, setPersonIdentifierError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState('');
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
    setPersonIdentifierError(null);
    setLastNameError('');
    resetRights();
    setRightsExpanded(false);
    setSubmitErrorDetails(null);
  };

  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.rightName);

  const personIdentifierValidation = getPersonIdentifierErrorKey(personIdentifier);
  const selectedRights = rights.filter((r) => r.checked).map((r) => r.rightKey);
  const isLastNameValid = lastName.trim().length >= 1;
  const isFormValid =
    !!actingParty?.partyUuid &&
    personIdentifier.trim().length > 0 &&
    personIdentifierValidation === null &&
    isLastNameValid &&
    selectedRights.length > 0 &&
    !isRightsLoading &&
    !rightsErrorDetails;

  const handleSubmit = () => {
    setSubmitErrorDetails(null);

    delegateInstanceRights({
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
      input: {
        to: {
          personIdentifier: personIdentifier.trim(),
          lastName: lastName.trim(),
        },
        directRightKeys: selectedRights,
      },
    })
      .unwrap()
      .then(() => {
        dispatch(connectionApi.util.invalidateTags(['Connections']));
        modalRef.current?.close();
      })
      .catch((error: unknown) => {
        const details = createErrorDetails(error);
        setSubmitErrorDetails(
          details ?? {
            status: '500',
            time: new Date().toISOString(),
          },
        );
      });
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
          {t('instance_detail_page.add_user_modal.heading')}
        </DsHeading>

        {submitErrorDetails && (
          <DsAlert data-color='danger'>
            {submitErrorDetails.status === '400' ? (
              <DsParagraph>{t('new_user_modal.not_found_error_person_ssn')}</DsParagraph>
            ) : submitErrorDetails.status === '429' ? (
              <DsParagraph>{t('new_user_modal.too_many_requests_error')}</DsParagraph>
            ) : (
              <>
                <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
                <TechnicalErrorParagraphs
                  status={submitErrorDetails.status}
                  time={submitErrorDetails.time}
                  traceId={submitErrorDetails.traceId}
                />
              </>
            )}
          </DsAlert>
        )}

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
          />
          <DsTextfield
            className={classes.textField}
            label={t('common.last_name')}
            data-size='sm'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() =>
              setLastNameError(isLastNameValid ? '' : t('new_user_modal.last_name_format_error'))
            }
            error={lastNameError}
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
              collapsible
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
            onClick={handleSubmit}
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
