import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import type { ProblemDetail } from '../../types';

import classes from './DelegationCheckError.module.css';
import { mapErrorCodeToErrorMessage } from '../../errorHandling';

interface DelegationCheckErrorProps {
  defaultError: string;
  error: {
    data: ProblemDetail;
  };
}

export const DelegationCheckError = ({
  defaultError,
  error,
}: DelegationCheckErrorProps): React.ReactNode => {
  const { t } = useTranslation();

  const getErrorMessage = (): string => {
    return t(mapErrorCodeToErrorMessage(error?.data.code)) || t(defaultError);
  };

  return (
    <div className={classes.delegationCheckError}>
      <DsAlert data-color='danger'>{getErrorMessage()}</DsAlert>
    </div>
  );
};
