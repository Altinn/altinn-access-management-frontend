import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider, Snackbar } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../DelegationModal/EditModal';

import { AccessPackageList } from './AccessPackageList';

type AccessPackageListPropsAndCustomArgs = React.ComponentProps<typeof AccessPackageList>;

export default {
  title: 'Features/AMUI/AccessPackageList',
  component: AccessPackageList,
  render: (args) => (
    <Provider store={store}>
      <RootProvider>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='456'
          actingPartyUuid='123'
        >
          <AccessPackageList
            {...args}
            onSelect={(accessPackage) => console.log('onSelect:', accessPackage)}
            onDelegateSuccess={(accessPackage, toParty) =>
              console.log('onDelegateSuccess:', accessPackage, toParty)
            }
            onDelegateError={(accessPackage, error) =>
              console.log('onDelegateError:', accessPackage, error)
            }
            onRevokeSuccess={(accessPackage, toParty) =>
              console.log('onRevokeSuccess:', accessPackage, toParty)
            }
            onRevokeError={(accessPackage, error) =>
              console.log('onRevokeError:', accessPackage, error)
            }
          />
        </PartyRepresentationProvider>
        <Snackbar />
      </RootProvider>
    </Provider>
  ),
  argTypes: {
    showAllAreas: {
      control: 'boolean',
      description: 'Show all areas expanded by default',
    },
    showAllPackages: {
      control: 'boolean',
      description: 'Show all packages in each area',
    },
    minimizeAvailablePackages: {
      control: 'boolean',
      description: 'Minimize the display of available packages',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    useDeleteConfirm: {
      control: 'boolean',
      description: 'Use delete confirmation dialog',
    },
    searchString: {
      control: 'text',
      description: 'Search string to filter packages',
    },
    availableActions: {
      control: 'check',
      options: Object.values(DelegationAction),
      description: 'Available actions for delegation',
    },
    onSelect: { control: { disabled: true } },
    onDelegateSuccess: { control: { disabled: true } },
    onDelegateError: { control: { disabled: true } },
    onRevokeSuccess: { control: { disabled: true } },
    onRevokeError: { control: { disabled: true } },
  },
} as Meta<AccessPackageListPropsAndCustomArgs>;

export const Default: StoryObj<AccessPackageListPropsAndCustomArgs> = {
  args: {
    showAllAreas: true,
    showAllPackages: true,
    minimizeAvailablePackages: false,
    isLoading: false,
    useDeleteConfirm: true,
    searchString: '',
    availableActions: [DelegationAction.DELEGATE, DelegationAction.REVOKE],
  },
};
