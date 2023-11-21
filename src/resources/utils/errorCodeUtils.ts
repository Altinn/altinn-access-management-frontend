export enum ErrorCode {
  MissingRoleAccess = 'MissingRoleAccess',
  MissingDelegationAccess = 'MissingDelegationAccess',
  MissingSrrRightAccess = 'MissingSrrRightAccess',
  HTTPError = 'HTTPError',
  Unknown = 'Unknown',
}

export const getSingleRightsErrorCodeTextKey = (errorCode: string | undefined) => {
  switch (errorCode) {
    case ErrorCode.MissingRoleAccess:
      return 'single_rights.missing_role_access';
    case ErrorCode.MissingDelegationAccess:
      return 'single_rights.missing_delegation_access';
    case ErrorCode.MissingSrrRightAccess:
      return 'single_rights.missing_srr_right_access';
    case ErrorCode.Unknown:
      return 'single_rights.unknown';
    case ErrorCode.HTTPError:
      return 'single_rights.generic_error_try_again';
    default:
      return 'single_rights.new_error';
  }
};

export const prioritizeErrors = (errors: string[]) => {
  const priorityOrder: string[] = [
    ErrorCode.HTTPError,
    ErrorCode.MissingRoleAccess,
    ErrorCode.MissingDelegationAccess,
    ErrorCode.MissingSrrRightAccess,
    ErrorCode.Unknown,
  ];

  errors.sort((a, b) => {
    return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
  });

  return errors;
};
