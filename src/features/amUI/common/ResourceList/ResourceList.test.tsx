import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResourceList } from './ResourceList';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createResource = (overrides: Partial<ServiceResource> = {}): ServiceResource => ({
  identifier: overrides.identifier ?? `resource-${Math.random().toString(36).slice(2, 8)}`,
  title: overrides.title ?? 'Altinn Resource',
  description: overrides.description ?? 'Description',
  resourceType: overrides.resourceType ?? 'GenericAccessResource',
  resourceOwnerName: overrides.resourceOwnerName ?? 'Altinn',
  resourceOwnerOrgcode: overrides.resourceOwnerOrgcode ?? 'org',
  resourceOwnerOrgNumber: overrides.resourceOwnerOrgNumber ?? '123456789',
  resourceOwnerLogoUrl: overrides.resourceOwnerLogoUrl ?? 'logo.png',
  ...overrides,
});

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

  it('uses custom description text while preserving ownerName', () => {
    const resources = [createResource({ title: 'With Description Text' })];

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
      createResource({ title: 'Alpha Service' }),
      createResource({ title: 'Beta Service' }),
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
        title: 'Skatt Service',
        resourceOwnerName: 'Skatteetaten',
        resourceOwnerOrgcode: 'skd',
      }),
      createResource({
        title: 'Nav Service',
        resourceOwnerName: 'Nav',
        resourceOwnerOrgcode: 'nav',
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
        title: 'Skatt Service',
        resourceOwnerName: 'Skatteetaten',
        resourceOwnerOrgcode: 'skd',
      }),
      createResource({
        title: 'Nav Service',
        resourceOwnerName: 'Nav',
        resourceOwnerOrgcode: 'nav',
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
      ...createResource({ title: 'Expired Service' }),
      resourceType: 'MigratedApp',
    } as ServiceResource;

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
      ...createResource({ title: 'Migrated Correspondence Service' }),
      identifier: 'some-migratedcorrespondence-service',
    } as ServiceResource;

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
      ...createResource({ title: 'Migrated Correspondence Service' }),
      identifier: 'some-migratedcorrespondence-service',
      status: 'Deprecated',
    } as ServiceResource;

    render(
      <ResourceList
        resources={[expiredResource]}
        enableSearch={false}
      />,
    );

    expect(screen.getByText('resource_list.expired_badge')).toBeInTheDocument();
  });

  it('does not render the expired badge for a non-expired resource', () => {
    const normalResource = createResource({ title: 'Normal Service' });

    render(
      <ResourceList
        resources={[normalResource]}
        enableSearch={false}
      />,
    );

    expect(screen.queryByText('resource_list.expired_badge')).not.toBeInTheDocument();
  });
});
