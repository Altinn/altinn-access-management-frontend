import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceList } from './ResourceList';

const sampleResources: ServiceResource[] = [
  {
    identifier: 'resource-1',
    title: 'Altinn Resource',
    description: 'Access to core Altinn services.',
    rightDescription: '',
    resourceOwnerName: 'Digitaliseringsdirektoratet',
    resourceOwnerLogoUrl: 'https://altinncdn.no/orgs/digdir/digdir.svg',
    resourceOwnerOrgcode: 'digdir',
    resourceOwnerOrgNumber: '991825827',
    resourceReferences: [],
    resourceType: 'GenericAccessResource',
    delegable: true,
  },
  {
    identifier: 'resource-2',
    title: 'Tax Reporting',
    description: 'Allows submitting tax data on behalf of an organization.',
    rightDescription: '',
    resourceOwnerName: 'Skatteetaten',
    resourceOwnerLogoUrl: '',
    resourceOwnerOrgcode: 'skd',
    resourceOwnerOrgNumber: '974761076',
    resourceReferences: [],
    resourceType: 'GenericAccessResource',
    delegable: true,
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
  },
};

export default meta;

type Story = StoryObj<typeof ResourceList>;

export const Default: Story = {};

export const WithControls: Story = {
  args: {
    resources: sampleResources,
    enableSearch: false,
    renderControls: (resource) => <span>{`Action for ${resource.title}`}</span>,
    getBadge: (_, index) =>
      index === 0 ? { label: 'New', theme: 'base', color: 'success' } : undefined,
  },
};

export const NonInteractive: Story = {
  args: {
    resources: sampleResources,
    enableSearch: false,
    interactive: false,
    showDetails: false,
  },
};
