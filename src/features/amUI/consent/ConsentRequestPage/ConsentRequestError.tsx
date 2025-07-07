import { DsAlert } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ProblemDetail } from '../types';

interface ConsentRequestErrorProps {
  defaultError: string;
  error: {
    data: ProblemDetail;
  };
}

export const ConsentRequestError = ({ defaultError, error }: ConsentRequestErrorProps) => {
  const { t } = useTranslation();

  const getErrorMessage = (): string => {
    switch (error?.data?.code) {
      case 'CTUI-00000':
        return t('consent_errors.not_authorized_for_consent');
      case 'CTUI-00001':
        return t('consent_errors.consent_not_found');
      case 'CTUI-00002':
        return t('consent_errors.wrong_consent_status');
      case 'CTUI-00010':
        return t('consent_errors.wrong_revoke_status');
      case 'CTUI-00011':
        return t('consent_errors.consent_is_revoked');
      case 'CTUI-00013':
        return t('consent_errors.consent_is_expired');
      case 'CTUI-00014':
        return t('consent_errors.consent_is_not_accepted');
      case 'CTUI-00015':
        return t('consent_errors.wrong_reject_status');
      default:
        return t(defaultError);
    }
  };

  return <DsAlert data-color='danger'>{getErrorMessage()}</DsAlert>;
};
