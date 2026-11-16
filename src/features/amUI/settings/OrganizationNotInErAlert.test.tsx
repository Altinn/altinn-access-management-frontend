import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType } from '@/dataObjects/dtos/Party';

import { OrganizationNotInErAlert } from './OrganizationNotInErAlert';

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

let actingParty: { organizationIdentifier?: string; name: string; type: PartyType } | undefined;

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({ actingParty }),
}));

describe('OrganizationNotInErAlert', () => {
  beforeEach(() => {
    actingParty = undefined;
  });

  it('tells an organization outside ER that it cannot get notification addresses', () => {
    actingParty = {
      organizationIdentifier: '012345678',
      name: 'FYSIOTERAPAUTENE AS',
      type: PartyType.Organization,
    };

    render(<OrganizationNotInErAlert />);

    expect(screen.getByTestId('settings-not-in-er-alert')).toBeTruthy();
    expect(screen.getByText(/settings_page.not_in_er_heading/).textContent).toContain(
      'Fysioterapautene AS',
    );
    expect(screen.getByText('settings_page.not_in_er_info')).toBeTruthy();
  });

  it('shows nothing for an organization in ER', () => {
    actingParty = {
      organizationIdentifier: '312345678',
      name: 'ORG AS',
      type: PartyType.Organization,
    };

    render(<OrganizationNotInErAlert />);

    expect(screen.queryByTestId('settings-not-in-er-alert')).toBeNull();
  });

  it('shows nothing before the acting party is known', () => {
    render(<OrganizationNotInErAlert />);

    expect(screen.queryByTestId('settings-not-in-er-alert')).toBeNull();
  });
});
