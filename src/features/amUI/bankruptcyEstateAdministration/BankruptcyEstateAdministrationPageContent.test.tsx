import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType, type AuthorizedPartyEntity } from '@/dataObjects/dtos/Party';

import { BankruptcyEstateAdministrationPageContent } from './BankruptcyEstateAdministrationPageContent';

let reportee: AuthorizedPartyEntity | undefined;
let isLoadingReportee = false;
let isBankruptcyEstateAdmin: boolean | undefined;
let isLoadingAccess = false;
const accessQuery = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      options?.name ? `${key} ${options.name}` : key,
  }),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({ actingParty: reportee, isLoading: false }),
}));

vi.mock('@/rtk/features/userInfoApi', () => ({
  useGetReporteeQuery: () => ({ data: reportee, isLoading: isLoadingReportee }),
}));

vi.mock('@/rtk/features/bankruptcyEstateApi', () => ({
  useGetIsBankruptcyEstateAdminQuery: (...args: unknown[]) => {
    accessQuery(...args);
    return { data: isBankruptcyEstateAdmin, isLoading: isLoadingAccess };
  },
}));

const person = { name: 'NORDMANN OLA', type: PartyType.Person } as AuthorizedPartyEntity;
const organization = { name: 'ACME AS', type: PartyType.Organization } as AuthorizedPartyEntity;

const warningText = 'bankruptcy_estate_administration_page.no_access_title';
const headingText = 'bankruptcy_estate_administration_page.page_heading Nordmann Ola';

beforeEach(() => {
  vi.clearAllMocks();
  reportee = undefined;
  isLoadingReportee = false;
  isBankruptcyEstateAdmin = undefined;
  isLoadingAccess = false;
});

describe('BankruptcyEstateAdministrationPageContent', () => {
  it('shows neither heading nor warning while the reportee is loading', () => {
    isLoadingReportee = true;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.queryByText(warningText)).toBeNull();
    expect(screen.queryByText(headingText)).toBeNull();
  });

  it('shows the warning for an organization without asking the BFF', () => {
    reportee = organization;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.getByText(warningText)).toBeInTheDocument();
    expect(accessQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it('shows the heading for a person with estates', () => {
    reportee = person;
    isBankruptcyEstateAdmin = true;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.getByText(headingText)).toBeInTheDocument();
    expect(screen.queryByText(warningText)).toBeNull();
    expect(accessQuery).toHaveBeenCalledWith(undefined, { skip: false });
  });

  it('shows the warning for a person without estates', () => {
    reportee = person;
    isBankruptcyEstateAdmin = false;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.getByText(warningText)).toBeInTheDocument();
    expect(screen.queryByText(headingText)).toBeNull();
  });
});
