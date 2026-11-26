import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PackageSearchToolbar } from './PackageSearchToolbar';

const PackageSearchToolbarWithState = ({
  initialServiceOwners = [],
}: {
  initialServiceOwners?: string[];
}) => {
  const [searchString, setSearchString] = useState('');
  const [serviceOwners, setServiceOwners] = useState(initialServiceOwners);
  return (
    <PackageSearchToolbar
      searchString={searchString}
      setSearchString={setSearchString}
      serviceOwners={serviceOwners}
      setServiceOwners={setServiceOwners}
    />
  );
};

const meta: Meta<typeof PackageSearchToolbarWithState> = {
  title: 'Features/AMUI/PackageSearchToolbar',
  component: PackageSearchToolbarWithState,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <RootProvider>
          <Story />
        </RootProvider>
      </Provider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PackageSearchToolbarWithState>;

export const Default: Story = {};

export const WithServiceOwner: Story = {
  args: { initialServiceOwners: ['skd'] },
};
