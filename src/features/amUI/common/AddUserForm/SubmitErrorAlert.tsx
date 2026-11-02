import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';

import { NewUserAlert } from '../RecipientFields/NewUserAlert';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import type { RecipientKind } from './recipient';

export interface SubmitError {
  error: ActionError;
  /**
   * Set when the step that failed is the one that adds the recipient, whose 400 means they could
   * not be found. Left out for a later step, which by then knows the recipient exists.
   */
  recipientKind?: RecipientKind;
}

/*** What an "add a new user" flow shows when its submit fails */
export const SubmitErrorAlert = ({ submitError }: { submitError: SubmitError | null }) => {
  const { t } = useTranslation();

  return (
    <div aria-live='assertive'>
      {submitError?.recipientKind && (
        <NewUserAlert
          userType={submitError.recipientKind}
          error={{
            status: submitError.error.httpStatus,
            time: submitError.error.timestamp,
            traceId: submitError.error.details?.traceId,
          }}
        />
      )}
      {submitError && !submitError.recipientKind && (
        <DsAlert
          data-size='sm'
          data-color='danger'
        >
          <DsParagraph data-size='sm'>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            status={submitError.error.httpStatus}
            time={submitError.error.timestamp}
            traceId={submitError.error.details?.traceId}
            size='sm'
          />
        </DsAlert>
      )}
    </div>
  );
};
