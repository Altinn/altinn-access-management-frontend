import { DsAlert, DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ActionError } from '@/resources/hooks/useActionError';
import { PartyType } from '@/rtk/features/userInfoApi';

import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ValidationErrorMessage } from '../common/ValidationErrorMessage';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

interface ScopeActionAlertProps {
  actionError: ActionError;
  mode: 'delegate' | 'revoke';
}

export const ScopeActionAlert = ({ actionError, mode }: ScopeActionAlertProps) => {
  const { t } = useTranslation();
  const { toParty } = usePartyRepresentation();
  const errorCode = actionError.details?.errorCode ?? actionError.details?.detail;

  return (
    <DsAlert
      data-color='danger'
      data-size='sm'
    >
      <DsHeading
        level={2}
        data-size='2xs'
      >
        {t(
          mode === 'revoke'
            ? 'delegation_modal.general_error.revoke_heading'
            : 'delegation_modal.general_error.delegate_heading',
        )}
      </DsHeading>
      {errorCode ? (
        <ValidationErrorMessage
          errorCode={errorCode}
          translationValues={{
            entity_type:
              toParty?.partyTypeName === PartyType.Person
                ? t('common.persons_lowercase')
                : t('common.organizations_lowercase'),
          }}
        />
      ) : (
        <TechnicalErrorParagraphs
          size='xs'
          status={actionError.httpStatus}
          time={actionError.timestamp}
          traceId={actionError.details?.traceId}
        />
      )}
    </DsAlert>
  );
};
