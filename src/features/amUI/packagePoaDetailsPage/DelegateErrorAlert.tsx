import { DsAlert, DsButton, DsHeading } from '@altinn/altinn-components';
import { XMarkIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/rtk/features/userInfoApi';
import { type Party } from '@/rtk/features/lookupApi';
import { type ActionError } from '@/resources/hooks/useActionError';

import { ValidationErrorMessage } from '../common/ValidationErrorMessage';
import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import pageClasses from './PackagePoaDetailsPage.module.css';

interface DelegateErrorAlertProps {
  error: ActionError;
  targetParty?: Party;
  onClose: () => void;
}

export const DelegateErrorAlert = ({ error, targetParty, onClose }: DelegateErrorAlertProps) => {
  const { t } = useTranslation();
  if (!error) return null;

  const entityType =
    targetParty?.partyTypeName === PartyType.Person
      ? t('common.persons_lowercase')
      : t('common.organizations_lowercase');

  return (
    <DsAlert
      data-color='danger'
      data-size='sm'
      className={pageClasses.delegateErrorAlert}
    >
      <div className={pageClasses.delegateErrorHeader}>
        <DsHeading
          level={2}
          data-size='2xs'
        >
          {t('delegation_modal.general_error.delegate_heading')}
        </DsHeading>
        <DsButton
          variant='tertiary'
          icon
          data-size='sm'
          onClick={onClose}
          aria-label={t('common.close')}
        >
          <XMarkIcon fontSize='1.2rem' />
        </DsButton>
      </div>
      {error.details?.detail || error.details?.errorCode ? (
        <ValidationErrorMessage
          errorCode={error.details?.errorCode ?? error.details?.detail ?? ''}
          translationValues={{ entity_type: entityType }}
        />
      ) : (
        <TechnicalErrorParagraphs
          size='xs'
          status={error.httpStatus}
          time={error.timestamp}
        />
      )}
    </DsAlert>
  );
};
