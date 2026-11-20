import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';
import { PartyType } from '@/dataObjects/dtos/Party';

import { SubunitRequestsAlert } from './SubunitRequestsAlert';

const meta: Meta<typeof SubunitRequestsAlert> = {
  title: 'Features/AMUI/SubunitRequestsAlert',
  component: SubunitRequestsAlert,
  args: {
    reportee: {
      id: '2a2f6ea4-ae81-4098-8e14-a68dec6f9aac',
      name: 'LEVENDE KUNSTIG APE',
      organizationIdentifier: '312787075',
      type: PartyType.Organization,
      unitType: 'FLI',
      isDeleted: false,
      authorizedResources: [],
      authorizedRoles: [],
      onlyHierarchyElementWithNoAccess: false,
    },
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <RootProvider>
          <div style={{ maxWidth: '50rem' }}>
            <Story />
          </div>
        </RootProvider>
      </Provider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SubunitRequestsAlert>;

export const Default: Story = {};
