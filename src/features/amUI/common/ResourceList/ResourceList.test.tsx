import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceList } from './ResourceList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createResource = (overrides: Partial<ServiceResource> = {}): ServiceResource => ({
  identifier: `resource-${Math.random().toString(36).slice(2, 8)}`,
  title: 'Altinn Resource',
  description: 'Description',
  rightDescription: '',
  resourceOwnerName: 'Altinn',
  resourceOwnerLogoUrl: 'logo.png',
  resourceOwnerOrgcode: 'org',
  resourceOwnerOrgNumber: '123456789',
  resourceReferences: [],
  resourceType: 'GenericAccessResource',
  delegable: true,
  ...overrides,
});

// Stands in for the router Link that consumers pass through getItemAs.
const linkTo =
  (href: string): React.ElementType =>
  (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        // Let any onClick the list passed through still run, but keep jsdom from navigating.
        props.onClick?.(event);
        event.preventDefault();
      }}
    />
  );

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

  it('renders the owner logo resolved by the backend', () => {
    const resources = [
      createResource({
        title: 'With Logo',
        resourceOwnerName: 'Skatteetaten',
        resourceOwnerLogoUrl: 'https://altinncdn.no/orgs/skd/skd.svg',
      }),
    ];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
      />,
    );

    expect(screen.getByAltText('Skatteetaten')).toHaveAttribute(
      'src',
      'https://altinncdn.no/orgs/skd/skd.svg',
    );
  });

  it('filters resources based on the search input', async () => {
    const user = userEvent.setup();
    const resources = [
      createResource({ title: 'Alpha Service' }),
      createResource({ title: 'Beta Service' }),
    ];

    render(<ResourceList resources={resources} />);

    await user.type(screen.getAllByRole('searchbox')[0], 'Beta');

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Alpha Service/i })).not.toBeInTheDocument();
    });
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
    };

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
    };

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
    };

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

  it('renders rows as the element from getItemAs and leaves onSelect alone', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const resources = [createResource({ title: 'Linked Service' })];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
        onSelect={handleSelect}
        getItemAs={() => linkTo('/service/linked')}
      />,
    );

    const link = screen.getByRole('link', { name: /Linked Service/i });
    expect(link).toHaveAttribute('href', '/service/linked');
    expect(screen.queryByRole('button', { name: /Linked Service/i })).not.toBeInTheDocument();

    await user.click(link);

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('does not open the details dialog for a row rendered via getItemAs', async () => {
    const user = userEvent.setup();
    const resources = [
      createResource({ title: 'Linked Service', description: 'Only shown in the details dialog' }),
    ];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
        getItemAs={() => linkTo('/service/linked')}
      />,
    );

    await user.click(screen.getByRole('link', { name: /Linked Service/i }));

    expect(screen.queryByText('Only shown in the details dialog')).not.toBeInTheDocument();
  });

  it('falls back to the default button row when getItemAs returns undefined', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const resources = [
      createResource({ title: 'Linked Service' }),
      createResource({ title: 'Plain Service' }),
    ];

    render(
      <ResourceList
        resources={resources}
        enableSearch={false}
        onSelect={handleSelect}
        getItemAs={(resource) =>
          resource.title === 'Linked Service' ? linkTo('/service/linked') : undefined
        }
      />,
    );

    expect(screen.getByRole('link', { name: /Linked Service/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Plain Service/i }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plain Service' }));
  });
});
