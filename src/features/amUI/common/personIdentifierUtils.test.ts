import { describe, expect, it } from 'vitest';

import { getPersonIdentifierErrorKey, isPersonInputValid } from './personIdentifierUtils';

describe('getPersonIdentifierErrorKey', () => {
  it('accepts an 11 digit national identity number', () => {
    expect(getPersonIdentifierErrorKey('20838198385')).toBeNull();
  });

  it('accepts a username of at least six characters', () => {
    expect(getPersonIdentifierErrorKey('medaljong')).toBeNull();
  });

  it('says nothing about an empty field', () => {
    expect(getPersonIdentifierErrorKey('')).toBeNull();
    expect(getPersonIdentifierErrorKey('   ')).toBeNull();
  });

  it('rejects digits that are not 11 long', () => {
    expect(getPersonIdentifierErrorKey('2083819838')).toBe(
      'new_user_modal.person_identifier_ssn_format_error',
    );
  });

  it('rejects a username shorter than six characters', () => {
    expect(getPersonIdentifierErrorKey('medal')).toBe(
      'new_user_modal.person_identifier_username_format_error',
    );
  });

  it('rejects whitespace inside the identifier', () => {
    expect(getPersonIdentifierErrorKey('208381 98385')).toBe(
      'new_user_modal.person_identifier_whitespace_forbidden_error',
    );
  });
});

describe('isPersonInputValid', () => {
  it('accepts a well formed identifier with a last name', () => {
    expect(isPersonInputValid({ personIdentifier: '20838198385', lastName: 'Medaljong' })).toBe(
      true,
    );
    expect(isPersonInputValid({ personIdentifier: 'medaljong', lastName: 'M' })).toBe(true);
  });

  it('tolerates surrounding whitespace, since the flows trim before submitting', () => {
    expect(isPersonInputValid({ personIdentifier: ' 20838198385 ', lastName: ' Medaljong ' })).toBe(
      true,
    );
  });

  it('rejects an empty identifier, which getPersonIdentifierErrorKey alone calls fine', () => {
    expect(isPersonInputValid({ personIdentifier: '', lastName: 'Medaljong' })).toBe(false);
    expect(isPersonInputValid({ personIdentifier: '   ', lastName: 'Medaljong' })).toBe(false);
  });

  it('rejects a malformed identifier', () => {
    expect(isPersonInputValid({ personIdentifier: '2083819838', lastName: 'Medaljong' })).toBe(
      false,
    );
  });

  it('rejects a missing last name', () => {
    expect(isPersonInputValid({ personIdentifier: '20838198385', lastName: '' })).toBe(false);
    expect(isPersonInputValid({ personIdentifier: '20838198385', lastName: '  ' })).toBe(false);
  });
});
