import { describe, expect, it } from 'vitest';

import { PartyType } from '@/dataObjects/dtos/Party';

import { formatEntityDisplayName } from './reporteeUtils';

describe('formatEntityDisplayName', () => {
  it('formats a party by its type', () => {
    expect(formatEntityDisplayName({ name: 'NORDMANN OLA', type: PartyType.Person })).toBe(
      'Nordmann Ola',
    );
    expect(formatEntityDisplayName({ name: 'TEST BEDRIFT AS', type: PartyType.Organization })).toBe(
      'Test Bedrift AS',
    );
  });

  it('leaves system user names as they are', () => {
    expect(formatEntityDisplayName({ name: 'SYSTEMBRUKER AS', type: PartyType.SystemUser })).toBe(
      'SYSTEMBRUKER AS',
    );
  });

  it('returns an empty string for a missing entity', () => {
    expect(formatEntityDisplayName(undefined)).toBe('');
    expect(formatEntityDisplayName(null)).toBe('');
  });
});
