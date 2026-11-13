import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';

import { BankruptcyEstateAdministratorInfoModal } from './BankruptcyEstateAdministratorInfoModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { trustee?: string }) =>
      options?.trustee ? `${key} ${options.trustee}` : key,
  }),
  Trans: ({ i18nKey, components }: { i18nKey: string; components: { a: React.ReactElement } }) =>
    React.cloneElement(components.a, {}, i18nKey),
}));

const trustee: PartyEntity = {
  id: 'trustee-uuid',
  name: 'BJARNE BOSTYRER',
  type: PartyType.Person,
  isDeleted: false,
};

const linkText = 'user_roles.bankruptcy_estate_administrator_managed_at';

const renderModal = (isTrusteeSelectedActor: boolean) =>
  render(
    <MemoryRouter>
      <BankruptcyEstateAdministratorInfoModal
        open
        onClose={vi.fn()}
        trustee={trustee}
        isTrusteeSelectedActor={isTrusteeSelectedActor}
      />
    </MemoryRouter>,
  );

describe('BankruptcyEstateAdministratorInfoModal', () => {
  it('names the trustee and lists the three packages', () => {
    renderModal(true);

    expect(
      screen.getByRole('heading', { name: 'user_roles.is_bankruptcy_estate_administrator' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('user_roles.bankruptcy_estate_administrator_intro Bjarne Bostyrer'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('links straight to the administration page when the trustee is the selected actor', () => {
    renderModal(true);

    expect(screen.getByRole('link', { name: linkText })).toHaveAttribute(
      'href',
      '/bankruptcy-estate-administration',
    );
  });

  it('links through an actor switch when someone else is the selected actor', () => {
    renderModal(false);

    const href = screen.getByRole('link', { name: linkText }).getAttribute('href') ?? '';
    expect(href).toContain('reportee/changeandredirect');
    expect(href).toContain('partyUuid=trustee-uuid');
    expect(decodeURIComponent(href)).toContain(
      '/accessmanagement/ui/bankruptcy-estate-administration',
    );
  });
});
