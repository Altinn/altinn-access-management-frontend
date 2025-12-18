import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { ResourceList } from './ResourceList';

const sampleResources = [
  {
    id: 'resource-1',
    name: 'Altinn Resource',
    title: 'Altinn Resource',
    description: 'Access to core Altinn services.',
    provider: {
      id: 'digdir',
      name: 'Digitaliseringsdirektoratet',
      refId: 'digdir',
      logoUrl: '',
      code: 'digdir',
      typeId: 'agencies',
    },
    resourceOwnerName: 'Digitaliseringsdirektoratet',
    resourceOwnerLogoUrl: '',
    resourceOwnerOrgcode: 'digdir',
    resourceOwnerOrgNumber: '991825827',
    resourceOwnerType: 'state',
  },
  {
    id: 'resource-2',
    name: 'Tax Reporting',
    title: 'Tax Reporting',
    description: 'Allows submitting tax data on behalf of an organization.',
    provider: {
      id: 'skd',
      name: 'Skatteetaten',
      refId: 'skd',
      logoUrl: '',
      code: 'skd',
      typeId: 'agencies',
    },
    resourceOwnerName: 'Skatteetaten',
    resourceOwnerLogoUrl: '',
    resourceOwnerOrgcode: 'skd',
    resourceOwnerOrgNumber: '974761076',
    resourceOwnerType: 'state',
  },
];

const meta: Meta<typeof ResourceList> = {
  title: 'Features/AMUI/ResourceList',
  component: ResourceList,
  render: (args) => (
    <Provider store={store}>
      <RootProvider>
        <ResourceList {...args} />
      </RootProvider>
    </Provider>
  ),
  args: {
    resources: sampleResources,
    enableSearch: true,
    resolveLogos: false,
  },
};

export default meta;

type Story = StoryObj<typeof ResourceList>;

export const Default: Story = {};

export const WithControls: Story = {
  args: {
    resources: sampleResources,
    enableSearch: false,
    resolveLogos: false,
    renderControls: (resource) => <span>{`Action for ${resource.title}`}</span>,
    getBadge: (_, index) =>
      index === 0 ? { label: 'New', theme: 'base', color: 'success' } : undefined,
  },
};

export const NonInteractive: Story = {
  args: {
    resources: sampleResources,
    enableSearch: false,
    resolveLogos: false,
    interactive: false,
    showDetails: false,
  },
};
