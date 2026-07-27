import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';
import { DatabaseIcon, FilesIcon, PackageIcon, PersonGroupIcon } from '@navikt/aksel-icons';

import { AmTabs } from './AmTabs';

export default {
  title: 'Features/AMUI/AmTabs',
  component: AmTabs,
  render: (args) => (
    <RootProvider>
      <AmTabs {...args} />
    </RootProvider>
  ),
} satisfies Meta<typeof AmTabs>;

type Story = StoryObj<typeof AmTabs>;

export const WithIconsAndBadges: Story = {
  render: () => (
    <RootProvider>
      <AmTabs defaultValue='packages'>
        <AmTabs.List>
          <AmTabs.Tab
            value='packages'
            label='Access packages'
            icon={<PackageIcon aria-hidden='true' />}
            badge={3}
          />
          <AmTabs.Tab
            value='services'
            label='Services'
            icon={<FilesIcon aria-hidden='true' />}
            badge={12}
          />
          <AmTabs.Tab
            value='roles'
            label='Roles'
            icon={<DatabaseIcon aria-hidden='true' />}
            badge={0}
          />
        </AmTabs.List>
        <AmTabs.Panel value='packages'>Content for access packages tab</AmTabs.Panel>
        <AmTabs.Panel value='services'>Content for services tab</AmTabs.Panel>
        <AmTabs.Panel value='roles'>Content for roles tab</AmTabs.Panel>
      </AmTabs>
    </RootProvider>
  ),
};

export const WithIconsNoBadge: Story = {
  render: () => (
    <RootProvider>
      <AmTabs defaultValue='suppliers'>
        <AmTabs.List>
          <AmTabs.Tab
            value='suppliers'
            label='Suppliers'
            icon={<PersonGroupIcon aria-hidden='true' />}
          />
          <AmTabs.Tab
            value='consumers'
            label='Consumers'
            icon={<DatabaseIcon aria-hidden='true' />}
          />
        </AmTabs.List>
        <AmTabs.Panel value='suppliers'>Content for suppliers tab</AmTabs.Panel>
        <AmTabs.Panel value='consumers'>Content for consumers tab</AmTabs.Panel>
      </AmTabs>
    </RootProvider>
  ),
};

export const WithBadgesNoIcon: Story = {
  render: () => (
    <RootProvider>
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
          <AmTabs.Tab
            value='roles'
            label='Roles'
            badge={0}
          />
        </AmTabs.List>
        <AmTabs.Panel value='packages'>Content for access packages tab</AmTabs.Panel>
        <AmTabs.Panel value='services'>Content for services tab</AmTabs.Panel>
        <AmTabs.Panel value='roles'>Content for roles tab</AmTabs.Panel>
      </AmTabs>
    </RootProvider>
  ),
};

export const TextOnly: Story = {
  render: () => (
    <RootProvider>
      <AmTabs defaultValue='person'>
        <AmTabs.List>
          <AmTabs.Tab
            value='person'
            label='Person'
          />
          <AmTabs.Tab
            value='organization'
            label='Organization'
          />
        </AmTabs.List>
        <AmTabs.Panel value='person'>Content for person tab</AmTabs.Panel>
        <AmTabs.Panel value='organization'>Content for organization tab</AmTabs.Panel>
      </AmTabs>
    </RootProvider>
  ),
};
