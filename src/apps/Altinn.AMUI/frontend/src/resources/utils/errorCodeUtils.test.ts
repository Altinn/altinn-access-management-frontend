import { describe, it, expect } from 'vitest';

import { ErrorCode, isAccessListFailure } from './errorCodeUtils';

describe('isAccessListFailure', () => {
  it('returns true when access list fails even though the user has role access', () => {
    expect(isAccessListFailure(['RoleAccess', ErrorCode.AccessListValidationFail])).toBe(true);
  });

  it('returns true when the service owner has not granted access', () => {
    expect(isAccessListFailure([ErrorCode.MissingSrrRightAccess])).toBe(true);
  });

  it('returns false when the user is missing access', () => {
    expect(
      isAccessListFailure([ErrorCode.MissingRoleAccess, ErrorCode.AccessListValidationFail]),
    ).toBe(false);
  });

  it('returns false when there is no access list reason', () => {
    expect(isAccessListFailure(['RoleAccess'])).toBe(false);
    expect(isAccessListFailure([])).toBe(false);
  });
});
