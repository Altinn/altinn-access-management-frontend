export enum ErrorCode {
  MissingRoleAccess = 'MissingRoleAccess',
  MissingRightAccess = 'MissingRightAccess',
  MissingDelegationAccess = 'MissingDelegationAccess',
  MissingPackageAccess = 'MissingPackageAccess',
  MissingSrrRightAccess = 'MissingSrrRightAccess',
  HTTPError = 'HTTPError',
  Unauthorized = 'Unauthorized',
  InsufficientAuthenticationLevel = 'InsufficientAuthenticationLevel',
  AccessListValidationFail = 'AccessListValidationFail',
  Unknown = 'Unknown',
}

const missingAccessCodes: string[] = [
  ErrorCode.MissingRoleAccess,
  ErrorCode.MissingRightAccess,
  ErrorCode.MissingDelegationAccess,
  ErrorCode.MissingPackageAccess,
];

const accessListCodes: string[] = [
  ErrorCode.MissingSrrRightAccess,
  ErrorCode.AccessListValidationFail,
];

export const hasMissingAccessCode = (reasonCodes: string[]) =>
  reasonCodes.some((reasonCode) => missingAccessCodes.includes(reasonCode));

export const isAccessListFailure = (reasonCodes: string[]) =>
  !hasMissingAccessCode(reasonCodes) &&
  reasonCodes.some((reasonCode) => accessListCodes.includes(reasonCode));
