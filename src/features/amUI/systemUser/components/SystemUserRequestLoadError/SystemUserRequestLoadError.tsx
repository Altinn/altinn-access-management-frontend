import React from 'react';
import { ProblemDetail } from '../../types';
import { DsAlert } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { mapErrorCodeToErrorMessage } from '../../errorHandling';

interface SystemUserRequestLoadErrorProps {
  error?: ProblemDetail;
}

export const SystemUserRequestLoadError = ({ error }: SystemUserRequestLoadErrorProps) => {
  const { t } = useTranslation();

  let errorText = mapErrorCodeToErrorMessage(error?.code);
  if (!errorText && error?.status === 404) {
    errorText = 'systemuser_request.load_request_error_notfound';
  } else if (!errorText && error?.status === 403) {
    errorText = 'systemuser_request.load_request_missing_permissions';
  } else if (!errorText) {
    errorText = 'systemuser_request.load_request_error';
  }

  return <DsAlert data-color='danger'>{t(errorText)}</DsAlert>;
};
