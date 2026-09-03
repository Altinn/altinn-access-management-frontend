import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResourceList } from './ResourceList';
import type { ResourceListItemResource } from './types';

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
    type: {
      id: '0197a840-2ee9-75f4-879e-9d9197683d88',
      name: 'GenericAccessResource',
    },
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

  it('filters by service owner and resets when "all service owners" is selected', async () => {
    const user = userEvent.setup();
    const resources = [
      createResource({
        name: 'Skatt Service',
        provider: { ...baseProvider, name: 'Skatteetaten', code: 'skd' },
      }),
      createResource({
        name: 'Nav Service',
        provider: { ...baseProvider, name: 'Nav', code: 'nav' },
      }),
    ];

    render(<ResourceList resources={resources} />);

    await user.click(screen.getByRole('button', { name: 'resource_list.all_serviceowners' }));
    await user.click(screen.getByRole('option', { name: /Skatteetaten/i }));

    expect(screen.getByRole('button', { name: /Skatt Service/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nav Service/i })).not.toBeInTheDocument();

    // The filter menu stays open after picking an owner, so "all service owners" is right there.
    await user.click(screen.getByRole('option', { name: 'resource_list.all_serviceowners' }));

    expect(screen.getByRole('button', { name: /Skatt Service/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nav Service/i })).toBeInTheDocument();
  });

  it('leaves out "all service owners" while searching the service owner filter', async () => {
    const user = userEvent.setup();
    const resources = [
      createResource({
        name: 'Skatt Service',
        provider: { ...baseProvider, name: 'Skatteetaten', code: 'skd' },
      }),
      createResource({
        name: 'Nav Service',
        provider: { ...baseProvider, name: 'Nav', code: 'nav' },
      }),
    ];

    render(<ResourceList resources={resources} />);

    await user.click(screen.getByRole('button', { name: 'resource_list.all_serviceowners' }));
    const ownerSearch = screen.getByRole('combobox');
    await user.type(ownerSearch, 'Skatt');

    // Left in the list it would be listed as selected next to the hits.
    expect(screen.getByRole('option', { name: /Skatteetaten/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'resource_list.all_serviceowners' }),
    ).not.toBeInTheDocument();

    // Nor does it come back as a hit when the query matches its own label.
    await user.clear(ownerSearch);
    await user.type(ownerSearch, 'resource_list.all');

    expect(
      screen.queryByRole('option', { name: 'resource_list.all_serviceowners' }),
    ).not.toBeInTheDocument();
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

  it('does not render the expired badge for a migratedcorrespondence resource that is not deprecated', () => {
    const nonExpiredResource = {
      ...createResource({ name: 'Migrated Correspondence Service' }),
      identifier: 'some-migratedcorrespondence-service',
    } as ResourceListItemResource;

    render(
      <ResourceList
        resources={[nonExpiredResource]}
        enableSearch={false}
      />,
    );

    expect(screen.queryByText('resource_list.expired_badge')).not.toBeInTheDocument();
  });

  it('renders the expired badge for a migratedcorrespondence resource with deprecated status', () => {
    const expiredResource = {
      ...createResource({ name: 'Migrated Correspondence Service' }),
      identifier: 'some-migratedcorrespondence-service',
      status: 'Deprecated',
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
