import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { RootProvider } from '@altinn/altinn-components';

import no_nb from '@/localizations/no_nb.json';

import { RightsTabs } from './RightsTabs';

vi.mock('@/rtk/features/accessPackageApi', () => ({
  useGetUserDelegationsQuery: () => ({ data: undefined }),
}));

vi.mock('../PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    toParty: { id: 'to' },
    fromParty: { id: 'from' },
    actingParty: { id: 'acting' },
  }),
}));

const i18n = createInstance({
  lng: 'no_nb',
  resources: { no_nb: { translation: no_nb } },
});
void i18n.init();

const renderRightsTabs = (initialEntry = '/user/1#roleAssignments') =>
  render(
    <I18nextProvider i18n={i18n}>
      <RootProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <RightsTabs
            packagesPanel={<div>packages panel</div>}
            singleRightsPanel={<div>single rights panel</div>}
            roleAssignmentsPanel={<div>roles panel</div>}
          />
        </MemoryRouter>
      </RootProvider>
    </I18nextProvider>,
  );

describe('RightsTabs', () => {
  beforeEach(() => {
    window.featureFlags = { showRolesRemovedAlert: true } as Window['featureFlags'];
  });

  afterEach(() => {
    window.featureFlags = {} as Window['featureFlags'];
  });

  it('shows the role panel when the flag is off', () => {
    window.featureFlags = { showRolesRemovedAlert: false } as Window['featureFlags'];
    renderRightsTabs();

    expect(screen.getByText('roles panel')).toBeInTheDocument();
    expect(screen.queryByTestId('roles-removed-alert')).not.toBeInTheDocument();
  });

  it('replaces the role panel with the alert when the flag is on', () => {
    renderRightsTabs();

    expect(screen.getByRole('heading', { name: no_nb.role.roles_removed_heading })).toBeVisible();
    expect(screen.queryByText('roles panel')).not.toBeInTheDocument();
  });

  it('leaves the other tabs untouched when the flag is on', () => {
    renderRightsTabs('/user/1');

    expect(screen.getByText('packages panel')).toBeVisible();
  });

  it('keeps the query string in the links', () => {
    renderRightsTabs('/user/1?returnTo=%2Fusers#roleAssignments');

    expect(screen.getByRole('link', { name: 'Tilgangspakker' })).toHaveAttribute(
      'href',
      '/user/1?returnTo=%2Fusers',
    );
    expect(screen.getByRole('link', { name: 'Enkelttjenester' })).toHaveAttribute(
      'href',
      '/user/1?returnTo=%2Fusers#singleRights',
    );
  });

  it.each([
    ['Tilgangspakker', 'packages panel'],
    ['Enkelttjenester', 'single rights panel'],
  ])('switches tab when clicking the %s link', async (linkName, panelText) => {
    const user = userEvent.setup();
    renderRightsTabs();

    await user.click(screen.getByRole('link', { name: linkName }));

    expect(screen.getByText(panelText)).toBeVisible();
    expect(screen.getByTestId('roles-removed-alert')).not.toBeVisible();
  });
});
