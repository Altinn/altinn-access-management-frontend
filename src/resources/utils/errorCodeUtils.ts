export enum ErrorCode {
  MissingRoleAccess = 'MissingRoleAccess',
  MissingDelegationAccess = 'MissingDelegationAccess',
  MissingSrrRightAccess = 'MissingSrrRightAccess',
  HTTPError = 'HTTPError',
  Unauthorized = 'Unauthorized',
  InsufficientAuthenticationLevel = 'InsufficientAuthenticationLevel',
  Unknown = 'Unknown',
}

export const getErrorCodeTextKey = (errorCode: string | undefined): string | undefined => {
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
    case ErrorCode.Unauthorized:
      return 'single_rights.unauthorized_for_party';
    case ErrorCode.InsufficientAuthenticationLevel:
      return 'api_delegation.insufficient_authentication_level';
    case undefined:
      return undefined;
    default:
      return 'single_rights.new_error';
  }
};

export const prioritizeErrors = (errors: string[]): string[] => {
  const priorityOrder: string[] = [
    ErrorCode.Unauthorized,
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
