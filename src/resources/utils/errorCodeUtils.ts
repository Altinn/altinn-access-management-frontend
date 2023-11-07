export const getSingleRightsErrorCodeTextKey = (errorCode: string | undefined) => {
  switch (errorCode) {
    case 'MissingRoleAccess':
      return 'single_rights.missing_role_access';
    case 'MissingDelegationAccess':
      return 'single_rights.missing_delegation_access';
    case 'MissingSrrRightAccess':
      return 'single_rights.missing_srr_right_access';
    case 'Unknown':
      return 'single_rights.unknown';
    case 'HTTPError':
      return 'single_rights.generic_error_try_again';
    case undefined:
      return undefined;
    default:
      return 'single_rights.new_error';
  }
};
