import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResourceList } from './ResourceList';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

vi.mock('@/resources/hooks/useProviderLogoUrl', () => ({
  useProviderLogoUrl: () => ({
    getProviderLogoUrl: () => undefined,
    isLoading: false,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createResource = (overrides: Partial<ServiceResource> = {}): ServiceResource => {
  const id = overrides.identifier ?? `resource-${Math.random().toString(36).slice(2, 8)}`;

  return {
    identifier: id,
    title: overrides.title ?? 'Altinn Resource',
    description: overrides.description ?? 'Description',
    resourceOwnerName: overrides.resourceOwnerName ?? 'Altinn',
    resourceOwnerLogoUrl: overrides.resourceOwnerLogoUrl ?? 'logo.png',
    resourceOwnerOrgcode: overrides.resourceOwnerOrgcode ?? 'org',
    resourceOwnerOrgNumber: overrides.resourceOwnerOrgNumber ?? '123456789',
    ...overrides,
  };
};

describe('ResourceList', () => {
  it('invokes onSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const resources = [
      createResource({ title: 'Resource One' }),
      createResource({ title: 'Resource Two' }),
    ];

    render(
      <ResourceList
        resources={resources}
        onSelect={handleSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Resource One/i }));
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('renders custom controls provided via renderControls and getBadge', () => {
    const resources = [createResource({ title: 'With Controls' })];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
        renderControls={() => <span data-testid='custom-control'>Custom</span>}
        getBadge={() => ({ label: 'Badge', theme: 'base', color: 'success' })}
      />,
    );

    expect(screen.getByTestId('custom-control')).toBeInTheDocument();
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('filters resources based on the search input', async () => {
    const user = userEvent.setup();
    const resources = [
      createResource({ title: 'Alpha Service' }),
      createResource({ title: 'Beta Service' }),
    ];

    render(<ResourceList resources={resources} />);

    await user.type(screen.getAllByRole('searchbox')[0], 'Beta');

    expect(screen.queryByRole('button', { name: /Alpha Service/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta Service/i })).toBeInTheDocument();
  });
});
