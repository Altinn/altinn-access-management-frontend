import { describe, expect, it } from 'vitest';

import { PartyType } from '@/rtk/features/userInfoApi';

import { formatEntityDisplayName } from './reporteeUtils';

describe('formatEntityDisplayName', () => {
  it('formats a Party by partyTypeName', () => {
    expect(formatEntityDisplayName({ name: 'NORDMANN OLA', partyTypeName: PartyType.Person })).toBe(
      'Nordmann Ola',
    );
    expect(
      formatEntityDisplayName({ name: 'TEST BEDRIFT AS', partyTypeName: PartyType.Organization }),
    ).toBe('Test Bedrift AS');
  });

  it('formats a User or ReporteeInfo by type, ignoring case', () => {
    expect(formatEntityDisplayName({ name: 'NORDMANN OLA', type: 'person' })).toBe('Nordmann Ola');
    expect(formatEntityDisplayName({ name: 'TEST BEDRIFT AS', type: 'Organisasjon' })).toBe(
      'Test Bedrift AS',
    );
  });

  it('returns an empty string for a missing entity', () => {
    expect(formatEntityDisplayName(undefined)).toBe('');
    expect(formatEntityDisplayName(null)).toBe('');
  });
});
