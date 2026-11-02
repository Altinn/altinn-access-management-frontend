import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsHeading } from '@altinn/altinn-components';

import { AmTabs } from '../AmTabs/AmTabs';
import { OrgLookupFields } from '../RecipientFields/OrgLookupFields';
import { PersonFields } from '../RecipientFields/PersonFields';

import type { OrgRecipientOption, Recipient, RecipientKind, RecipientOption } from './recipient';
import { useRecipientForm } from './useRecipientForm';
import classes from './AddUserForm.module.css';

const TAB_LABEL: Record<RecipientKind, string> = {
  person: 'new_user_modal.person',
  org: 'new_user_modal.organization',
};

export interface AddUserFormProps {
  /*** Rendered as the level 2 heading, so every add-user dialog is titled the same way */
  heading: string;
  /*** Given to the heading. The flow owns the dialog, so it wires the same id to aria-labelledby */
  headingId: string;
  /**
   * Which recipients this form can take, in tab order. The first is selected, and a single kind
   * renders no tabs at all. Each carries its own submit label, so a kind cannot be offered without
   * one or labelled without being offered.
   */
  recipientKinds: readonly RecipientOption[];
  /**
   * Everything the flow does with the recipient: adding them as right holder, delegating, closing
   * its dialog, notifying the page. The flow reports its own failures, typically with
   * SubmitErrorAlert in children, and its progress through isSubmitting.
   */
  onSubmit: (recipient: Recipient) => void;
  /*** While true the fields and the button are disabled, and the button shows that it is working */
  isSubmitting: boolean;
  /*** ANDed with recipient validity, for flows whose payload reaches past the recipient */
  isSubmitDisabled?: boolean;
  /*** Called when another tab is picked, so the flow can clear an error about the previous one */
  onKindChange?: (kind: RecipientKind) => void;
  /*** Extra payload UI, rendered between the recipient fields and the submit button */
  children?: React.ReactNode;
}

/**
 * The heading, recipient tabs and fields shared by every "add a new user" flow, and the one submit
 * button. Submitting hands the flow the recipient once the active tab describes one completely.
 *
 * The form holds no dialog, only its heading. Flows render it inside their own, and unmount it
 * while that is closed so reopening gives a clean form.
 */
export const AddUserForm = ({
  heading,
  headingId,
  recipientKinds,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  onKindChange,
  children,
}: AddUserFormProps) => {
  const { t } = useTranslation();
  const orgOption = recipientKinds.find(
    (option): option is OrgRecipientOption => option.type === 'org',
  );
  const { recipient, person, setPerson, orgLookup, kind, setKind } = useRecipientForm({
    initialKind: recipientKinds[0].type,
    ownOrgNumber: orgOption?.ownOrgNumber,
  });

  const activeOption = recipientKinds.find((option) => option.type === kind) ?? recipientKinds[0];

  const canSubmit = !!recipient && !isSubmitDisabled && !isSubmitting;

  const submit = () => {
    if (recipient && canSubmit) {
      onSubmit(recipient);
    }
  };

  const fieldsFor = (kind: RecipientKind) => (
    <div className={classes.fields}>
      {kind === 'person' ? (
        <PersonFields
          value={person}
          onChange={setPerson}
          onSubmit={submit}
          disabled={isSubmitting}
        />
      ) : (
        <OrgLookupFields
          lookup={orgLookup}
          warning={orgLookup.isOwnOrg && orgOption?.ownOrgWarning}
          onSubmit={submit}
          disabled={isSubmitting}
        />
      )}
    </div>
  );

  return (
    <>
      <DsHeading
        data-size='xs'
        level={2}
        className={classes.heading}
        id={headingId}
      >
        {heading}
      </DsHeading>

      {recipientKinds.length > 1 ? (
        <AmTabs
          value={kind}
          onChange={(value) => {
            setKind(value as RecipientKind);
            onKindChange?.(value as RecipientKind);
          }}
        >
          <AmTabs.List>
            {recipientKinds.map((option) => (
              <AmTabs.Tab
                key={option.type}
                value={option.type}
                label={t(TAB_LABEL[option.type])}
              />
            ))}
          </AmTabs.List>
          {recipientKinds.map((option) => (
            <AmTabs.Panel
              key={option.type}
              value={option.type}
            >
              {fieldsFor(option.type)}
            </AmTabs.Panel>
          ))}
        </AmTabs>
      ) : (
        fieldsFor(recipientKinds[0].type)
      )}

      {children}

      <DsButton
        className={classes.submit}
        onClick={submit}
        disabled={!canSubmit}
        loading={isSubmitting}
      >
        {activeOption.submitLabel}
      </DsButton>
    </>
  );
};
