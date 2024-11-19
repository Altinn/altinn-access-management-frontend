import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { userInfoApi } from '@/rtk/features/userInfoApi';

import { ConfirmationPage } from './ConfirmationPage';

const mockState = {
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
    chosenOrgs: [
      { orgNumber: '123456789', name: 'Organization 1' },
      { orgNumber: '987654321', name: 'Organization 2' },
    ],
  },
};

const mockStore = configureStore({
  reducer: {
    apiDelegation: (state = mockState.apiDelegation) => state,
    delegableApi: (state = { chosenApis: mockState.apiDelegation.chosenApis }) => state,
    [userInfoApi.reducerPath]: userInfoApi.reducer,
  },
  preloadedState: mockState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(userInfoApi.middleware),
} as const);

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
