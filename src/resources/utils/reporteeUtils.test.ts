import { describe, expect, it } from 'vitest';

import { PartyType } from '@/dataObjects/dtos/Party';

import {
  formatEntityDisplayName,
  getAvatarType,
  getPartyColor,
  isOrganization,
  isSubUnit,
  isSystemUser,
} from './reporteeUtils';

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

describe('getAvatarType', () => {
  it.each([
    [PartyType.Person, 'person'],
    [PartyType.SelfIdentified, 'person'],
    [PartyType.Organization, 'company'],
    [PartyType.SystemUser, 'system'],
  ])('gives %s the %s avatar', (type, expected) => {
    expect(getAvatarType({ type })).toBe(expected);
  });

  it('falls back to person for a missing party', () => {
    expect(getAvatarType(undefined)).toBe('person');
  });
});

describe('getPartyColor', () => {
  it.each([
    [PartyType.Person, 'person'],
    [PartyType.SelfIdentified, 'person'],
    [PartyType.Organization, 'company'],
    [PartyType.SystemUser, 'company'],
  ])('gives %s the %s color', (type, expected) => {
    expect(getPartyColor({ type })).toBe(expected);
  });

  it('falls back to person for a missing party', () => {
    expect(getPartyColor(null)).toBe('person');
  });
});

describe('party type checks', () => {
  it('recognizes organizations and system users', () => {
    expect(isOrganization({ type: PartyType.Organization })).toBe(true);
    expect(isOrganization({ type: PartyType.Person })).toBe(false);
    expect(isSystemUser({ type: PartyType.SystemUser })).toBe(true);
    expect(isSystemUser({ type: PartyType.Organization })).toBe(false);
    expect(isOrganization(undefined)).toBe(false);
    expect(isSystemUser(null)).toBe(false);
  });

  it('recognizes subunits by organization unit type', () => {
    expect(isSubUnit({ type: PartyType.Organization, unitType: 'BEDR' })).toBe(true);
    expect(isSubUnit({ type: PartyType.Organization, unitType: 'AS' })).toBe(false);
    expect(isSubUnit({ type: PartyType.Person, unitType: 'BEDR' })).toBe(false);
    expect(isSubUnit(undefined)).toBe(false);
  });
});
