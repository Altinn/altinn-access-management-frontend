import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResourceList } from './ResourceList';
import type { PackageResource, ResourceProvider } from '@/rtk/features/accessPackageApi';

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

const baseProvider: ResourceProvider = {
  id: 'org',
  name: 'Altinn',
  refId: 'org',
  logoUrl: 'logo.png',
  code: 'org',
  typeId: 'type',
};

const createResource = (overrides: Partial<PackageResource> = {}): PackageResource => {
  const id = overrides.id ?? `resource-${Math.random().toString(36).slice(2, 8)}`;
  const provider = overrides.provider ?? baseProvider;

  return {
    id,
    name: overrides.name ?? 'Altinn Resource',
    title: overrides.title ?? overrides.name ?? 'Altinn Resource',
    description: overrides.description ?? 'Description',
    provider,
    resourceOwnerName: overrides.resourceOwnerName ?? provider.name,
    resourceOwnerLogoUrl: overrides.resourceOwnerLogoUrl ?? provider.logoUrl,
    resourceOwnerOrgcode: overrides.resourceOwnerOrgcode ?? provider.code,
    resourceOwnerOrgNumber: overrides.resourceOwnerOrgNumber ?? '123456789',
    resourceOwnerType: overrides.resourceOwnerType ?? 'type',
    ...overrides,
  };
};

describe('ResourceList', () => {
  it('invokes onSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const resources = [
      createResource({ name: 'Resource One' }),
      createResource({ name: 'Resource Two' }),
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
    const resources = [createResource({ name: 'With Controls' })];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
        showMoreButton={false}
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
      createResource({ name: 'Alpha Service' }),
      createResource({ name: 'Beta Service' }),
    ];

    render(<ResourceList resources={resources} />);

    await user.type(
      screen.getByRole('searchbox', {
        name: /package_resource_list\.resource_search_placeholder/i,
      }),
      'Beta',
    );

    expect(screen.queryByRole('button', { name: /Alpha Service/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta Service/i })).toBeInTheDocument();
  });

  it('reveals more resources when the show more button is clicked', async () => {
    const user = userEvent.setup();
    const resources = Array.from({ length: 12 }, (_, index) =>
      createResource({ id: `resource-${index}`, name: `Resource ${index}` }),
    );

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
      />,
    );

    expect(screen.queryByText(/common\.show_more/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /common\.show_more/i }));
    expect(screen.getByRole('button', { name: /Resource 11/i })).toBeInTheDocument();
  });
});
