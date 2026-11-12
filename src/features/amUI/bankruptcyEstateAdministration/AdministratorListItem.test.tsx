import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';

import { AdministratorListItem } from './AdministratorListItem';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./RemoveAdministratorButton', () => ({
  RemoveAdministratorButton: () => <button>remove_administrator</button>,
}));

vi.mock('./AdministratorAccess', () => ({
  AdministratorAccess: () => <div>administrator_access</div>,
}));

const administrator: PartyEntity = {
  id: '1',
  name: 'KURSIV FOSSEKALL',
  dateOfBirth: '1980-11-07',
  type: PartyType.Person,
  isDeleted: false,
};

const newTag = 'client_administration_page.new_agent_tag';

describe('AdministratorListItem', () => {
  it('shows the administrator closed, without the new marker for an old one', () => {
    render(
      <AdministratorListItem
        administrator={administrator}
        addedAt='2026-01-15T10:00:00+00:00'
      />,
    );

    expect(screen.getByText('Kursiv Fossekall')).toBeInTheDocument();
    expect(screen.queryByText('administrator_access')).toBeNull();
    expect(screen.queryByText(newTag)).toBeNull();
  });

  it('marks an administrator added within the last hour as new', () => {
    render(
      <AdministratorListItem
        administrator={administrator}
        addedAt={new Date().toISOString()}
      />,
    );

    expect(screen.getByText(newTag)).toBeInTheDocument();
  });

  it('opens and closes when the row is clicked', async () => {
    render(
      <AdministratorListItem
        administrator={administrator}
        addedAt='2026-01-15T10:00:00+00:00'
      />,
    );
    const row = screen.getByRole('button', { name: /Kursiv Fossekall/ });

    await userEvent.click(row);
    expect(screen.getByText('administrator_access')).toBeInTheDocument();

    await userEvent.click(row);
    expect(screen.queryByText('administrator_access')).toBeNull();
  });

  it('offers to remove the administrator only while the row is open', async () => {
    render(
      <AdministratorListItem
        administrator={administrator}
        addedAt='2026-01-15T10:00:00+00:00'
      />,
    );

    expect(screen.queryByRole('button', { name: 'remove_administrator' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /Kursiv Fossekall/ }));

    expect(screen.getByRole('button', { name: 'remove_administrator' })).toBeInTheDocument();
  });

  it('keeps the row open when the remove button is clicked', async () => {
    render(
      <AdministratorListItem
        administrator={administrator}
        addedAt='2026-01-15T10:00:00+00:00'
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Kursiv Fossekall/ }));

    await userEvent.click(screen.getByRole('button', { name: 'remove_administrator' }));

    expect(screen.getByText('administrator_access')).toBeInTheDocument();
  });
});
