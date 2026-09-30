import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsTextfield } from '@altinn/altinn-components';

import { getPersonIdentifierErrorKey, type PersonInput } from '../personIdentifierUtils';

import classes from './RecipientFields.module.css';

export interface PersonFieldsProps {
  value: PersonInput;
  onChange: (value: PersonInput) => void;
  /*** Called on Enter in either field. Whether that submits is the caller's decision */
  onSubmit: () => void;
  /*** Optional because a field left alone is simply enabled */
  disabled?: boolean;
}

/**
 * The person identifier and last name fields, shared by every flow that adds a person.
 *
 * Rendered as a fragment so the flow that owns the form keeps control of how the fields are
 * stacked. The format errors are kept as translation keys rather than translated strings, so they
 * follow a language change.
 */
export const PersonFields = ({ value, onChange, onSubmit, disabled }: PersonFieldsProps) => {
  const { t } = useTranslation();
  const [identifierErrorKey, setIdentifierErrorKey] = useState<string | null>(null);
  const [lastNameErrorKey, setLastNameErrorKey] = useState<string | null>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.repeat) {
      onSubmit();
    }
  };

  return (
    <>
      <DsTextfield
        className={classes.textField}
        label={t('new_user_modal.person_identifier')}
        data-size='sm'
        value={value.personIdentifier}
        onChange={(e) => onChange({ ...value, personIdentifier: e.target.value })}
        onBlur={() => setIdentifierErrorKey(getPersonIdentifierErrorKey(value.personIdentifier))}
        error={
          identifierErrorKey ? (
            <Trans
              i18nKey={identifierErrorKey}
              components={{ br: <br /> }}
            />
          ) : null
        }
        disabled={disabled}
        onKeyDown={onKeyDown}
      />
      <DsTextfield
        className={classes.textField}
        label={t('common.last_name')}
        data-size='sm'
        value={value.lastName}
        onChange={(e) => onChange({ ...value, lastName: e.target.value })}
        onBlur={() =>
          setLastNameErrorKey(
            value.lastName.trim().length >= 1 ? null : 'new_user_modal.last_name_format_error',
          )
        }
        error={lastNameErrorKey ? t(lastNameErrorKey) : null}
        disabled={disabled}
        onKeyDown={onKeyDown}
      />
    </>
  );
};
