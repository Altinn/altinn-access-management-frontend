import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph, DsTextfield } from '@altinn/altinn-components';

import { formatOrgNr, isSubUnitByType } from '@/resources/utils/reporteeUtils';

import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { NewUserAlert } from './NewUserAlert';

import type { OrgLookup } from './useOrgLookup';
import classes from './RecipientFields.module.css';

export interface OrgLookupFieldsProps {
  lookup: OrgLookup;
  /*** The flow's own error, shown when the lookup itself has none to report */
  errorDetails?: { status: string; time: string } | null;
  /*** Shown in place of any error, for a reason the flow decides - e.g. "this is your own org" */
  warning?: React.ReactNode;
  /*** Called on Enter in the field, but only while canSubmit is true */
  onSubmit?: () => void;
  canSubmit?: boolean;
  disabled?: boolean;
}

/**
 * The org number field and the organisation it resolves to.
 *
 * Rendered as a fragment, like PersonFields, so the flow keeps control of how the form is stacked.
 * Everything that can go wrong with the lookup is announced from one live region above the field,
 * so the flows do not each decide where their org errors appear.
 */
export const OrgLookupFields = ({
  lookup,
  errorDetails,
  warning,
  onSubmit,
  canSubmit = false,
  disabled,
}: OrgLookupFieldsProps) => {
  const { t } = useTranslation();

  const error = lookup.isError ? createErrorDetails(lookup.error) : errorDetails;

  return (
    <>
      <div aria-live='assertive'>
        {warning ||
          (error && (
            <NewUserAlert
              userType='org'
              error={error}
            />
          ))}
      </div>
      <DsTextfield
        className={classes.textField}
        label={t('common.org_number')}
        data-size='sm'
        value={lookup.orgNumber}
        onChange={(e) => lookup.setOrgNumber(e.target.value)}
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.repeat && canSubmit) {
            onSubmit?.();
          }
        }}
      />
      <div aria-live='polite'>
        {lookup.isValid && lookup.orgData && (
          <div className={classes.searchResult}>
            <DsHeading
              data-size='2xs'
              level={3}
            >
              {t('new_user_modal.org_search_result_label')}
            </DsHeading>
            <DsParagraph>
              <strong>{lookup.orgData.name}</strong>
            </DsParagraph>
            <DsParagraph data-size='sm'>
              {t('common.org_nr')} {formatOrgNr(lookup.orgData.orgNumber)}
              {isSubUnitByType(lookup.orgData.unitType) && ' - ' + t('common.subunit')}
            </DsParagraph>
          </div>
        )}
      </div>
    </>
  );
};
