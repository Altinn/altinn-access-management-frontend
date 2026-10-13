import { DsAlert, DsButton, DsHeading } from '@altinn/altinn-components';
import { XMarkIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import type { ComponentProps } from 'react';

import { PartyType } from '@/rtk/features/userInfoApi';
import { type Party } from '@/rtk/features/lookupApi';
import { type ActionError } from '@/resources/hooks/useActionError';

import { ValidationErrorMessage } from '../common/ValidationErrorMessage';
import { TechnicalErrorParagraphs } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import pageClasses from './PackagePoaDetailsPage.module.css';

interface DelegateErrorAlertProps {
  error: ActionError;
  targetParty?: Party;
  /*** Renders a close button when given. Left out where the alert goes away with its container */
  onClose?: () => void;
  /*** Keeps the heading in order with the ones around it, e.g. 3 inside a dialog titled at 2 */
  headingLevel?: ComponentProps<typeof DsHeading>['level'];
}

export const DelegateErrorAlert = ({
  error,
  targetParty,
  onClose,
  headingLevel = 2,
}: DelegateErrorAlertProps) => {
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
    >
      <div className={pageClasses.delegateErrorAlert}>
        <div className={pageClasses.delegateErrorHeader}>
          <DsHeading
            level={headingLevel}
            data-size='2xs'
          >
            {t('delegation_modal.general_error.delegate_heading')}
          </DsHeading>
        </div>
        {onClose && (
          <div className={pageClasses.delegateErrorCloseButton}>
            <DsButton
              className={pageClasses.dismissButton}
              variant='tertiary'
              icon
              data-size='sm'
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <XMarkIcon
                fontSize='1.2rem'
                aria-hidden='true'
              />
            </DsButton>
          </div>
        )}
        <div className={pageClasses.delegateErrorMessage}>
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
              traceId={error.details?.traceId}
            />
          )}
        </div>
      </div>
    </DsAlert>
  );
};
