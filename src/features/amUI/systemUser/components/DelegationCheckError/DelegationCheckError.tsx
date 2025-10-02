import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import type { ProblemDetail } from '../../types';

import classes from './DelegationCheckError.module.css';

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
    switch (error?.data?.code) {
      case 'AMUI-00001':
        return t('systemuser_delegation_errors.01_rights_not_found_or_not_delegable');
      case 'AMUI-00002':
        return t('systemuser_delegation_errors.02_rights_failed_to_delegate');
      case 'AMUI-00003':
        return t('systemuser_delegation_errors.03_systemuser_failed_to_create');
      case 'AMUI-00004':
        return t('systemuser_delegation_errors.04_system_user_already_exists');
      case 'AMUI-00011':
        return t('systemuser_delegation_errors.11_system_not_found');
      case 'AMUI-00014':
        return t('systemuser_delegation_errors.14_unable_to_do_delegation_check');
      case 'AMUI-00016':
        return t('systemuser_delegation_errors.16_delegation_right_missing_role_access');
      case 'AMUI-00018':
        return t('systemuser_delegation_errors.18_delegation_right_missing_delegation_access');
      case 'AMUI-00019':
        return t('systemuser_delegation_errors.19_delegation_right_missing_srr_right_access');
      case 'AMUI-00020':
        return t(
          'systemuser_delegation_errors.20_delegation_right_insufficient_authentication_level',
        );
      case 'AMUI-00051':
        return t('systemuser_delegation_errors.51_accesspackage_delegation_failed');
      case 'AMUI-00053':
        return t(
          'systemuser_delegation_errors.53_accesspackage_delegation_missing_required_access',
        );
      case 'AMUI-00055':
        return t('systemuser_delegation_errors.55_accesspackage_failed_to_get_delegated_packages');
      case 'AMUI-00057':
        return t('systemuser_delegation_errors.57_systemuser_failed_to_delete_accesspackage');

      default:
        return t(defaultError);
    }
  };

  return (
    <div className={classes.delegationCheckError}>
      <DsAlert data-color='danger'>{getErrorMessage()}</DsAlert>
    </div>
  );
};
