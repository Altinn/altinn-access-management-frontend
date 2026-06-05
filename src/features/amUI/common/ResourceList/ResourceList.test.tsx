import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResourceList } from './ResourceList';
import type { PackageResource, ResourceProvider } from '@/rtk/features/accessPackageApi';
import type { ResourceListItemResource } from './types';

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
        renderControls={() => <span data-testid='custom-control'>Custom</span>}
        getBadge={() => ({ label: 'Badge', theme: 'base', color: 'success' })}
      />,
    );

    expect(screen.getByTestId('custom-control')).toBeInTheDocument();
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('uses custom description text while preserving ownerName', () => {
    const resources = [createResource({ name: 'With Description Text' })];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
        getDescriptionText={() => '3 scopes'}
      />,
    );

    expect(screen.getByText('3 scopes')).toBeInTheDocument();
    expect(screen.getByAltText('Altinn')).toBeInTheDocument();
  });

  it('filters resources based on the search input', async () => {
    const user = userEvent.setup();
    const resources = [
      createResource({ name: 'Alpha Service' }),
      createResource({ name: 'Beta Service' }),
    ];

    render(<ResourceList resources={resources} />);

    await user.type(screen.getAllByRole('searchbox')[0], 'Beta');

    expect(screen.queryByRole('button', { name: /Alpha Service/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta Service/i })).toBeInTheDocument();
  });

  it('renders the expired badge for a resource with resourceType MigratedApp', () => {
    const expiredResource = {
      ...createResource({ name: 'Expired Service' }),
      resourceType: 'MigratedApp',
    } as ResourceListItemResource;

    render(
      <ResourceList
        resources={[expiredResource]}
        enableSearch={false}
      />,
    );

    expect(screen.getByText('resource_list.expired_badge')).toBeInTheDocument();
  });

  it('renders the expired badge for a resource whose identifier includes migratedcorrespondence', () => {
    const expiredResource = {
      ...createResource({ name: 'Migrated Correspondence Service' }),
      identifier: 'some-migratedcorrespondence-service',
    } as ResourceListItemResource;

    render(
      <ResourceList
        resources={[expiredResource]}
        enableSearch={false}
      />,
    );

    expect(screen.getByText('resource_list.expired_badge')).toBeInTheDocument();
  });

  it('does not render the expired badge for a non-expired resource', () => {
    const normalResource = createResource({ name: 'Normal Service' });

    render(
      <ResourceList
        resources={[normalResource]}
        enableSearch={false}
      />,
    );

    expect(screen.queryByText('resource_list.expired_badge')).not.toBeInTheDocument();
  });
});
