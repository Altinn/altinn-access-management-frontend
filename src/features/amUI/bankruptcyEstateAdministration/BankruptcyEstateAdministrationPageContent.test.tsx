import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType, type AuthorizedPartyEntity } from '@/dataObjects/dtos/Party';

import { BankruptcyEstateAdministrationPageContent } from './BankruptcyEstateAdministrationPageContent';

let reportee: AuthorizedPartyEntity | undefined;
let isLoadingReportee = false;
let isBankruptcyEstateAdmin: boolean | undefined;
let isLoadingAccess = false;
let isAccessError = false;
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
    return { data: isBankruptcyEstateAdmin, isLoading: isLoadingAccess, isError: isAccessError };
  },
}));

vi.mock('./AddAdministratorButton', () => ({
  AddAdministratorButton: () => <button>add_administrator</button>,
}));

vi.mock('./AdministratorList', () => ({
  AdministratorList: ({ searchString }: { searchString: string }) => (
    <div data-search={searchString}>administrator_list</div>
  ),
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
  isAccessError = false;
  window.featureFlags = { enableBankruptcyEstateAdministration: true } as Window['featureFlags'];
});

describe('BankruptcyEstateAdministrationPageContent', () => {
  it('shows neither heading nor warning while the reportee is loading', () => {
    isLoadingReportee = true;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.queryByText(warningText)).toBeNull();
    expect(screen.queryByText(headingText)).toBeNull();
    expect(screen.queryByRole('button', { name: 'add_administrator' })).toBeNull();
    expect(screen.queryByText('bankruptcy_estate_administration_page.intro')).toBeNull();
    expect(screen.queryByText('administrator_list')).toBeNull();
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
    expect(screen.getByRole('button', { name: 'add_administrator' })).toBeInTheDocument();
    expect(screen.getByText('Nordmann Ola')).toBeInTheDocument();
    expect(screen.getByText('bankruptcy_estate_administration_page.trustee')).toBeInTheDocument();
    expect(screen.getByText('bankruptcy_estate_administration_page.intro')).toBeInTheDocument();
    expect(
      screen.getByLabelText('bankruptcy_estate_administration_page.info_icon_label'),
    ).toBeInTheDocument();
    expect(screen.getByText('bankruptcy_estate_administration_page.info_body')).toBeInTheDocument();
    expect(screen.getByText('administrator_list')).toBeInTheDocument();
  });

  it('shows the warning for a person without estates', () => {
    reportee = person;
    isBankruptcyEstateAdmin = false;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.getByText(warningText)).toBeInTheDocument();
    expect(screen.queryByText(headingText)).toBeNull();
  });

  it('shows an error instead of the page when the access check fails', () => {
    reportee = person;
    isAccessError = true;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.getByRole('alert')).toHaveTextContent('common.general_error_paragraph');
    expect(screen.queryByText(headingText)).toBeNull();
    expect(screen.queryByText(warningText)).toBeNull();
  });

  it('shows the warning when the feature flag is off, even for a person with estates', () => {
    window.featureFlags = { enableBankruptcyEstateAdministration: false } as Window['featureFlags'];
    reportee = person;
    isBankruptcyEstateAdmin = true;

    render(<BankruptcyEstateAdministrationPageContent />);

    expect(screen.getByText(warningText)).toBeInTheDocument();
    expect(screen.queryByText(headingText)).toBeNull();
    expect(accessQuery).toHaveBeenCalledWith(undefined, { skip: true });
  });

  it('hands the search text to the administrator list', async () => {
    reportee = person;
    isBankruptcyEstateAdmin = true;

    render(<BankruptcyEstateAdministrationPageContent />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'common.search' }), 'ola');

    expect(screen.getByText('administrator_list')).toHaveAttribute('data-search', 'ola');
  });
});
