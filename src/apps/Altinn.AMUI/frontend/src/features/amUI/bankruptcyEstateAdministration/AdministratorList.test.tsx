import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType } from '@/dataObjects/dtos/Party';
import type { BankruptcyEstateAdministrator } from '@/rtk/features/bankruptcyEstateApi';

import { AdministratorList } from './AdministratorList';

let administrators: BankruptcyEstateAdministrator[] | undefined;
let isLoading = false;
let isError = false;

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/rtk/features/bankruptcyEstateApi', () => ({
  useGetAdministratorsQuery: () => ({ data: administrators, isLoading, isError }),
}));

const administrator = (
  id: string,
  name: string,
  dateOfBirth: string,
  adminAddedAt: string,
): BankruptcyEstateAdministrator => ({
  administrator: { id, name, dateOfBirth, type: PartyType.Person, isDeleted: false },
  adminRole: {
    id: 'role-id',
    code: 'innbygger-konkursbo-administrator',
    children: [],
    roleCodes: [],
  },
  adminAddedAt,
});

const emptyText = 'bankruptcy_estate_administration_page.no_administrators';
const newTag = 'client_administration_page.new_agent_tag';

beforeEach(() => {
  administrators = undefined;
  isLoading = false;
  isError = false;
});

describe('AdministratorList', () => {
  it('shows each administrator with name and date of birth', () => {
    administrators = [
      administrator('1', 'ESTETISK SKÅL', '1928-01-11', '2026-01-15T10:00:00+00:00'),
      administrator('2', 'KURSIV FOSSEKALL', '1980-11-07', '2026-03-02T08:30:00+00:00'),
    ];

    render(<AdministratorList searchString='' />);

    expect(screen.getByText('Estetisk Skål')).toBeInTheDocument();
    expect(screen.getByText('Kursiv Fossekall')).toBeInTheDocument();
    expect(screen.getByText(/11\.01\.1928/)).toBeInTheDocument();
    expect(screen.queryByText(newTag)).toBeNull();
  });

  it('marks an administrator added within the last hour as new', () => {
    administrators = [
      administrator('1', 'ESTETISK SKÅL', '1928-01-11', '2026-01-15T10:00:00+00:00'),
      administrator('2', 'KURSIV FOSSEKALL', '1980-11-07', new Date().toISOString()),
    ];

    render(<AdministratorList searchString='' />);

    expect(screen.getAllByText(newTag)).toHaveLength(1);
  });

  it('says so when no one has been made administrator yet', () => {
    administrators = [];

    render(<AdministratorList searchString='' />);

    expect(screen.getByText(emptyText)).toBeInTheDocument();
  });

  it('shows neither the list nor the empty text while loading', () => {
    isLoading = true;

    render(<AdministratorList searchString='' />);

    expect(screen.queryByText(emptyText)).toBeNull();
  });

  it('shows an error when the administrators cannot be fetched', () => {
    isError = true;

    render(<AdministratorList searchString='' />);

    expect(screen.getByRole('alert')).toHaveTextContent('common.general_error_paragraph');
    expect(screen.queryByText(emptyText)).toBeNull();
  });

  it('shows only the administrators whose name contains the search text', () => {
    administrators = [
      administrator('1', 'ESTETISK SKÅL', '1928-01-11', '2026-01-15T10:00:00+00:00'),
      administrator('2', 'KURSIV FOSSEKALL', '1980-11-07', '2026-03-02T08:30:00+00:00'),
    ];

    render(<AdministratorList searchString=' fosse ' />);

    expect(screen.getByText('Kursiv Fossekall')).toBeInTheDocument();
    expect(screen.queryByText('Estetisk Skål')).toBeNull();
  });

  it('says so when the search matches no administrator', () => {
    administrators = [
      administrator('1', 'ESTETISK SKÅL', '1928-01-11', '2026-01-15T10:00:00+00:00'),
    ];

    render(<AdministratorList searchString='nobody' />);

    expect(screen.getByText('advanced_user_search.user_no_search_result')).toBeInTheDocument();
    expect(screen.queryByText('Estetisk Skål')).toBeNull();
    expect(screen.queryByText(emptyText)).toBeNull();
  });

  it('shows new administrators first, then the rest by name', () => {
    administrators = [
      administrator('1', 'ZETA DAHL', '1970-01-01', '2026-01-15T10:00:00+00:00'),
      administrator('2', 'ALFA ANDERSEN', '1970-01-01', '2026-01-15T10:00:00+00:00'),
      administrator('3', 'MIDT BERG', '1970-01-01', new Date().toISOString()),
    ];

    render(<AdministratorList searchString='' />);

    const names = screen.getAllByText(/Andersen|Berg|Dahl/).map((element) => element.textContent);
    expect(names).toEqual(['Midt Berg', 'Alfa Andersen', 'Zeta Dahl']);
  });
});
