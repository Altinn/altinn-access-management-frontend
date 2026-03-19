import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DsAlert,
  DsButton,
  DsChip,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsPopover,
  DsTextfield,
  ListItem,
} from '@altinn/altinn-components';
import { CheckmarkCircleIcon, PlusIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { useInstanceDelegationCheckQuery } from '@/rtk/features/instanceApi';
import { useGetResourceRightsMetaQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { enableAddUserByUsername } from '@/resources/utils/featureFlagUtils';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import {
  ChipRight,
  mapRightsToChipRights,
} from '../common/DelegationModal/SingleRights/hooks/rightsUtils';
import { getPersonIdentifierErrorKey } from '../common/personIdentifierUtils';

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
  onComplete?: (draft: AddUserModalDraft) => void;
}

interface AddUserModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isOpen: boolean;
  resourceId: string;
  instanceUrn: string;
  onClose: () => void;
  onComplete?: (draft: AddUserModalDraft) => void;
}

const ModalRightChips = ({
  rights,
  setRights,
}: {
  rights: ChipRight[];
  setRights: React.Dispatch<React.SetStateAction<ChipRight[]>>;
}) => {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = useState('');

  const toggle = (right: ChipRight) =>
    setRights(
      rights.map((currentRight) => {
        if (currentRight.rightKey === right.rightKey && currentRight.delegable) {
          return { ...currentRight, checked: !currentRight.checked };
        }
        return currentRight;
      }),
    );

  const onActionClick = (right: ChipRight) => {
    if (right.inherited) {
      setPopoverOpen(right.rightKey);
    } else if (!right.delegable && right.checked) {
      setPopoverOpen(right.rightKey);
    } else {
      toggle(right);
    }
  };

  return (
    <>
      {rights
        .filter((right) => right.delegable || right.checked)
        .map((right) => {
          const isPopoverTarget = right.inherited || (!right.delegable && right.checked);
          const popoverText = isPopoverTarget
            ? right.inherited
              ? t('single_rights.action_popover.right_inherited')
              : t('single_rights.action_popover.right_not_delegable')
            : undefined;

          return (
            <div key={right.rightKey}>
              <DsChip.Checkbox
                className={classes.chip}
                data-size='sm'
                checked={right.checked}
                onClick={() => onActionClick(right)}
                popoverTarget={isPopoverTarget ? `popover_${right.rightKey}` : undefined}
                aria-describedby={isPopoverTarget ? `popover_${right.rightKey}` : undefined}
              >
                {right.rightName}
              </DsChip.Checkbox>
              <DsPopover
                id={`popover_${right.rightKey}`}
                open={popoverOpen === right.rightKey}
                placement='top'
                onClose={() => {
                  setPopoverOpen('');
                }}
                aria-live='polite'
                role='tooltip'
              >
                <div style={{ padding: '2px 2px' }}>{popoverText}</div>
              </DsPopover>
            </div>
          );
        })}
    </>
  );
};

export const AddUserButton = ({
  resourceId,
  instanceUrn,
  isLarge,
  onComplete,
}: AddUserButtonProps) => {
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
        onClose={() => {
          setIsOpen(false);
        }}
        onComplete={onComplete}
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
  onComplete,
}: AddUserModalProps) => {
  const { t } = useTranslation();
  const headingId = useId();
  const allowUsername = enableAddUserByUsername();
  const { actingParty } = usePartyRepresentation();

  const [personIdentifier, setPersonIdentifier] = useState('');
  const [lastName, setLastName] = useState('');
  const [personIdentifierFormatErrorKey, setPersonIdentifierFormatErrorKey] = useState<
    string | null
  >(null);
  const [lastNameFormatError, setLastNameFormatError] = useState('');
  const [rightsExpanded, setRightsExpanded] = useState(false);
  const [rights, setRights] = useState<ChipRight[]>([]);

  const {
    data: rightsMeta,
    isLoading: isRightsMetaLoading,
    error: rightsMetaError,
  } = useGetResourceRightsMetaQuery(
    {
      resourceId,
    },
    {
      skip: !isOpen || !resourceId,
    },
  );

  const {
    data: delegationCheckedRights,
    isLoading: isDelegationCheckLoading,
    error: delegationCheckError,
  } = useInstanceDelegationCheckQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: !isOpen || !actingParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const mappedRights = useMemo(() => {
    if (!rightsMeta || !delegationCheckedRights) {
      return [];
    }

    return mapRightsToChipRights(rightsMeta, delegationCheckedRights, {
      isChecked: (right) => right.result === true,
    });
  }, [delegationCheckedRights, rightsMeta]);

  useEffect(() => {
    setRights(mappedRights);
  }, [mappedRights]);

  const resetForm = () => {
    setPersonIdentifier('');
    setLastName('');
    setPersonIdentifierFormatErrorKey(null);
    setLastNameFormatError('');
    setRights(mappedRights);
    setRightsExpanded(false);
  };

  const onDialogClose = () => {
    resetForm();
    onClose();
  };

  const personIdentifierErrorKey = getPersonIdentifierErrorKey(personIdentifier, allowUsername);
  const rightsErrorDetails =
    createErrorDetails(rightsMetaError) ?? createErrorDetails(delegationCheckError);
  const isRightsLoading = isRightsMetaLoading || isDelegationCheckLoading;
  const selectedRights = rights.filter((right) => right.checked).map((right) => right.rightKey);
  const isLastNameValid = lastName.trim().length >= 1;
  const isFormValid =
    personIdentifier.trim().length > 0 &&
    personIdentifierErrorKey === null &&
    isLastNameValid &&
    selectedRights.length > 0 &&
    !isRightsLoading &&
    !rightsErrorDetails;

  const summaryTitle =
    rights.length === 0
      ? t('instance_detail_page.add_user_modal.no_rights_available')
      : rights.filter((right) => right.checked).length === rights.length
        ? t('delegation_modal.actions.access_to_all')
        : t('delegation_modal.actions.partial_access', {
            count: rights.filter((right) => right.checked).length,
            total: rights.length,
          });

  const handleComplete = () => {
    const draft: AddUserModalDraft = {
      personIdentifier: personIdentifier.trim(),
      lastName: lastName.trim(),
      resourceId,
      instanceUrn,
      selectedRights,
    };

    onComplete?.(draft);

    /*
    await createUserWithInstanceRights({
      personInput: {
        personIdentifier: draft.personIdentifier,
        lastName: draft.lastName,
      },
      resourceId: draft.resourceId,
      instanceUrn: draft.instanceUrn,
      rights: draft.selectedRights,
    }).unwrap();
    */

    modalRef.current?.close();
  };

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      aria-labelledby={headingId}
      className={classes.modal}
      onClose={onDialogClose}
    >
      <div className={classes.content}>
        <div>
          <DsHeading
            data-size='xs'
            level={2}
            id={headingId}
            className={classes.heading}
          >
            {t('new_user_modal.trigger_button_large')}
          </DsHeading>
        </div>

        <div className={classes.fields}>
          <DsTextfield
            className={classes.textField}
            label={allowUsername ? t('new_user_modal.person_identifier') : t('common.ssn')}
            data-size='sm'
            value={personIdentifier}
            onChange={(event) => {
              setPersonIdentifier(event.target.value);
            }}
            onBlur={() => {
              setPersonIdentifierFormatErrorKey(personIdentifierErrorKey);
            }}
            error={personIdentifierFormatErrorKey ? t(personIdentifierFormatErrorKey) : null}
          />

          <DsTextfield
            className={classes.textField}
            label={t('common.last_name')}
            data-size='sm'
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
            }}
            onBlur={() => {
              setLastNameFormatError(
                isLastNameValid ? '' : t('new_user_modal.last_name_format_error'),
              );
            }}
            error={lastNameFormatError}
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
              title={summaryTitle}
              onClick={() => {
                setRightsExpanded(!rightsExpanded);
              }}
              expanded={rightsExpanded}
              as='button'
              border='solid'
              shadow='none'
            >
              <div className={classes.rightExpandableContent}>
                <DsParagraph>{t('delegation_modal.actions.action_description')}</DsParagraph>
                <div className={classes.rightChips}>
                  <ModalRightChips
                    rights={rights}
                    setRights={setRights}
                  />
                </div>
              </div>
            </ListItem>
          )}
        </div>

        <div className={classes.buttonRow}>
          <DsButton
            onClick={handleComplete}
            disabled={!isFormValid}
          >
            {t('common.give_poa')}
          </DsButton>
        </div>
      </div>
    </DsDialog>
  );
};

export default AddUserModal;
