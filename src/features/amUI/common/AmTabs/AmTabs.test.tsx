import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';

import { AmTabs } from './AmTabs';

const renderTabs = (ui: React.ReactElement) => render(<RootProvider>{ui}</RootProvider>);

describe('AmTabs', () => {
  it('renders tab labels', () => {
    renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
          />
          <AmTabs.Tab
            value='b'
            label='Tab B'
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A</AmTabs.Panel>
        <AmTabs.Panel value='b'>Panel B</AmTabs.Panel>
      </AmTabs>,
    );

    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
  });

  it('shows content for the default active tab', () => {
    renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
          />
          <AmTabs.Tab
            value='b'
            label='Tab B'
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A content</AmTabs.Panel>
        <AmTabs.Panel value='b'>Panel B content</AmTabs.Panel>
      </AmTabs>,
    );

    expect(screen.getByText('Panel A content')).toBeVisible();
  });

  it('switches panel content when a tab is clicked', async () => {
    const user = userEvent.setup();

    renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
          />
          <AmTabs.Tab
            value='b'
            label='Tab B'
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A content</AmTabs.Panel>
        <AmTabs.Panel value='b'>Panel B content</AmTabs.Panel>
      </AmTabs>,
    );

    await user.click(screen.getByRole('tab', { name: /Tab B/i }));
    expect(screen.getByText('Panel B content')).toBeVisible();
  });

  it('calls onChange with the selected value when a tab is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderTabs(
      <AmTabs
        defaultValue='a'
        onChange={handleChange}
      >
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
          />
          <AmTabs.Tab
            value='b'
            label='Tab B'
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A</AmTabs.Panel>
        <AmTabs.Panel value='b'>Panel B</AmTabs.Panel>
      </AmTabs>,
    );

    await user.click(screen.getByRole('tab', { name: /Tab B/i }));
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('renders a badge with the given count', () => {
    const { container } = renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
            badge={5}
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A</AmTabs.Panel>
      </AmTabs>,
    );

    expect(container.querySelector('[data-count="5"]')).toBeInTheDocument();
  });

  it('renders multiple badges with correct counts', () => {
    const { container } = renderTabs(
      <AmTabs defaultValue='packages'>
        <AmTabs.List>
          <AmTabs.Tab
            value='packages'
            label='Access packages'
            badge={3}
          />
          <AmTabs.Tab
            value='services'
            label='Services'
            badge={12}
          />
        </AmTabs.List>
        <AmTabs.Panel value='packages'>Packages content</AmTabs.Panel>
        <AmTabs.Panel value='services'>Services content</AmTabs.Panel>
      </AmTabs>,
    );

    expect(container.querySelector('[data-count="3"]')).toBeInTheDocument();
    expect(container.querySelector('[data-count="12"]')).toBeInTheDocument();
  });

  it('does not render a badge when the badge prop is omitted', () => {
    const { container } = renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A</AmTabs.Panel>
      </AmTabs>,
    );

    expect(container.querySelector('[data-count]')).not.toBeInTheDocument();
  });

  it('renders the icon when provided', () => {
    renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
            icon={
              <PackageIcon
                data-testid='tab-icon'
                aria-hidden='true'
              />
            }
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A</AmTabs.Panel>
      </AmTabs>,
    );

    expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
  });

  it('renders icon alongside badge when both are provided', () => {
    const { container } = renderTabs(
      <AmTabs defaultValue='a'>
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
            icon={
              <PackageIcon
                data-testid='tab-icon'
                aria-hidden='true'
              />
            }
            badge={7}
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A</AmTabs.Panel>
      </AmTabs>,
    );

    expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
    expect(container.querySelector('[data-count="7"]')).toBeInTheDocument();
  });

  it('respects a controlled value prop', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderTabs(
      <AmTabs
        value='b'
        onChange={handleChange}
      >
        <AmTabs.List>
          <AmTabs.Tab
            value='a'
            label='Tab A'
          />
          <AmTabs.Tab
            value='b'
            label='Tab B'
          />
        </AmTabs.List>
        <AmTabs.Panel value='a'>Panel A content</AmTabs.Panel>
        <AmTabs.Panel value='b'>Panel B content</AmTabs.Panel>
      </AmTabs>,
    );

    expect(screen.getByText('Panel B content')).toBeVisible();
    await user.click(screen.getByRole('tab', { name: /Tab A/i }));
    expect(handleChange).toHaveBeenCalledWith('a');
  });
});
