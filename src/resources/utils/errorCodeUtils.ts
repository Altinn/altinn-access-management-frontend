export const getSingleRightsErrorCodeTextKey = (errorCode: string | undefined) => {
  if (errorCode === 'MissingRoleAccess') {
    return 'single_rights.missing_role_access';
  } else if (errorCode === 'MissingDelegationAccess') {
    return 'single_rights.missing_delegation_access';
  } else if (errorCode === 'Unknown') {
    return 'single_rights.unknown';
  } else if (errorCode === 'MissingSrrRightAccess') {
    return 'single_rights.missing_srr_right_access';
  } else if (errorCode === undefined) {
    return undefined;
  } else {
    return 'single_rights.new_error';
  }
};
