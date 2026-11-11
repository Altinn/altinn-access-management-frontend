import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';

import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs';

const VALIDATION_ERROR_TEXT: Record<string, string> = {
  'AM.VLD-00034': 'new_user_modal.not_found_error_person',
  'AM.VLD-00008': 'bankruptcy_estate_administration_page.add_administrator_not_person_error',
};

const getKnownErrorText = (error: ActionError): string | undefined => {
  if (error.httpStatus === '429') {
    return 'new_user_modal.too_many_requests_error';
  }
  const code = error.details?.validationErrors?.[0]?.code;
  return code ? VALIDATION_ERROR_TEXT[code] : undefined;
};

export const AddAdministratorErrorAlert = ({ error }: { error: ActionError | null }) => {
  const { t } = useTranslation();
  const knownErrorText = error ? getKnownErrorText(error) : undefined;

  return (
    <div aria-live='assertive'>
      {error && (
        <DsAlert
          data-size='sm'
          data-color='danger'
        >
          <DsParagraph data-size='sm'>
            {t(knownErrorText ?? 'common.general_error_paragraph')}
          </DsParagraph>
          {!knownErrorText && (
            <TechnicalErrorParagraphs
              status={error.httpStatus}
              time={error.timestamp}
              traceId={error.details?.traceId}
              size='sm'
            />
          )}
        </DsAlert>
      )}
    </div>
  );
};
