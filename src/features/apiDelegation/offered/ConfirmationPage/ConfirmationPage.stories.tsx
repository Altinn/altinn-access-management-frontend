import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import type { UnknownAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';

import { ConfirmationPage } from './ConfirmationPage';

const mockState = {
  delegableApi: {
    chosenApis: [
      {
        identifier: 'api_1',
        apiName: 'API 1',
        orgName: 'Organization 1',
        scopes: ['scope_1'],
        isLoading: false,
        errorCode: undefined,
        authorizationReference: [],
      },
      {
        identifier: 'api_2',
        apiName: 'API 2',
        orgName: 'Organization 2',
        scopes: ['scope_2'],
        isLoading: false,
        errorCode: undefined,
        authorizationReference: [],
      },
    ],
    chosenOrgs: [{ orgNumber: '123456789', name: 'Organization 1' }],
  },
  apiDelegation: {
    chosenApis: [
      {
        identifier: 'api_1',
        apiName: 'API 1',
        orgName: 'Organization 1',
        scopes: ['scope_1'],
        isLoading: false,
        errorCode: undefined,
        authorizationReference: [],
      },
      {
        identifier: 'api_2',
        apiName: 'API 2',
        orgName: 'Organization 2',
        scopes: ['scope_2'],
        isLoading: false,
        errorCode: undefined,
        authorizationReference: [],
      },
    ],
    chosenOrgs: [{ orgNumber: '123456789', name: 'Organization 1' }],
  },
};

const mockStore = configureStore({
  reducer: (state: unknown, action: UnknownAction) => {
    console.log(action);
    return state;
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  preloadedState: mockState,
});
export default {
  title: 'Features/Api delegation/ConfirmationPage',
  component: ConfirmationPage,
  render: (args) => (
    <Provider store={mockStore}>
      <ConfirmationPage {...args} />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {};
