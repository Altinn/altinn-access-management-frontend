import { describe, expect, it } from 'vitest';

import type { AgentDelegationCustomer, SystemUserAccessPackage } from '../types';

import { getMissingAccessPackages } from './customerUtils';

const accessPackage = (urn: string): SystemUserAccessPackage =>
  ({ id: urn, urn, name: urn }) as SystemUserAccessPackage;

const customer = (packages: string[], isSelfOrg?: boolean): AgentDelegationCustomer => ({
  id: 'customer-id',
  name: 'Customer',
  orgNo: '123456789',
  access: [{ role: 'urn:altinn:external-role:ccr:regnskapsforer', packages }],
  isSelfOrg,
});

const regnskap = accessPackage('urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet');
const lonn = accessPackage('urn:altinn:accesspackage:regnskapsforer-lonn');

describe('getMissingAccessPackages', () => {
  it('returns no packages when the customer has all of them', () => {
    expect(getMissingAccessPackages(customer([regnskap.urn, lonn.urn]), [regnskap, lonn])).toEqual(
      [],
    );
  });

  it('returns the packages the customer has not given access to', () => {
    expect(getMissingAccessPackages(customer([regnskap.urn]), [regnskap, lonn])).toEqual([lonn]);
  });

  it('returns no packages for the own organization', () => {
    expect(getMissingAccessPackages(customer([], true), [regnskap, lonn])).toEqual([]);
  });
});
