import React from 'react';
import { ProblemDetail } from '../../types';
import { DsAlert } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

interface SystemUserRequestLoadErrorProps {
  error: ProblemDetail;
}

export const SystemUserRequestLoadError = ({ error }: SystemUserRequestLoadErrorProps) => {
  const { t } = useTranslation();
  let errorText = 'systemuser_request.load_creation_request_error';
  if (error.code === 'AMUI-00010' || error.status === 404) {
    errorText = 'systemuser_request.load_request_error_notfound';
  } else if (error.code === 'AMUI-00066' || error.status === 403) {
    errorText = 'systemuser_request.load_request_missing_permissions';
  }

  return <DsAlert data-color='danger'>{t(errorText)}</DsAlert>;
};
