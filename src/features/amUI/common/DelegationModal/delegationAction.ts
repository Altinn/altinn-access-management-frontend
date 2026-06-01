/**
 * Standalone module for the DelegationAction enum so it can be imported without pulling in
 * EditModal. This avoids circular imports between modal wrappers and the *Info components.
 */
export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
  APPROVE = 'APPROVE',
}
