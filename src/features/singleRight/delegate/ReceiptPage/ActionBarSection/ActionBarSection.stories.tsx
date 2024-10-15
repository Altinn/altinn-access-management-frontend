import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import type { UnknownAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';

import {
  BFFDelegatedStatus,
  ReduxStatusResponse,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ActionBarSection } from './ActionBarSection';

export default {
  title: 'Features/SingleRight/ReceiptPage/ActionBarSection',
  component: ActionBarSection,
} as Meta;

export const Default: StoryObj = {
  args: {
    recipientName: 'Ola Nordmann',
  },
  render: (args) => (
    <Provider
      store={configureStore({
        preloadedState: initialMockState,
        reducer: function (state: unknown, action: UnknownAction) {
          console.log(action);
          return state;
        },
      })}
    >
      <ActionBarSection
        recipientName=''
        {...args}
      />
    </Provider>
  ),
};

const initialMockState = {
  singleRightsSlice: {
    processedDelegations: [
      {
        meta: {
          to: {
            id: '123',
            value: 'Ola Nordmann',
          },
          rights: [
            {
              resource: {
                id: '456',
                value: 'service_1',
              },
              action: 'action 1',
            },
          ],
          serviceDto: {
            serviceTitle: 'serviceTitle 1',
            serviceOwner: 'serviceOwner 1',
            serviceType: 'AltinnApp',
          },
        },
        bffResponseList: [
          {
            rightsKey: 'rightsKey A',
            action: 'action A',
            status: BFFDelegatedStatus.Delegated,
            details: [
              {
                code: 'code A',
                description: 'description A',
              },
            ],
          },
          {
            rightsKey: 'rightsKey C',
            action: 'action C',
            status: BFFDelegatedStatus.Delegated,
            details: [
              {
                code: 'code C',
                description: 'description C',
              },
            ],
          },
        ],
      },
      {
        meta: {
          to: {
            id: '123',
            value: 'Ola Nordmann',
          },
          rights: [
            {
              resource: {
                id: '456',
                value: 'service_2',
              },
              action: 'action 2',
            },
          ],
          serviceDto: {
            serviceTitle: 'serviceTitle 2',
            serviceOwner: 'serviceOwner 2',
            serviceType: 'sometype',
          },
        },
        bffResponseList: [
          {
            rightsKey: 'rightsKey B',
            action: 'action B',
            status: BFFDelegatedStatus.Delegated,
            details: [
              {
                code: 'code B',
                description: 'description B',
              },
            ],
          },
          {
            rightsKey: 'rightsKey D',
            action: 'action D',
            status: BFFDelegatedStatus.Delegated,
            details: [
              {
                code: 'code D',
                description: 'description D',
              },
            ],
          },
        ],
      },
      {
        meta: {
          to: {
            id: '123',
            value: 'Ola Nordmann',
          },
          rights: [
            {
              resource: {
                id: '456',
                value: 'service_3',
              },
              action: 'action 3',
            },
          ],
          serviceDto: {
            serviceTitle: 'serviceTitle 3',
            serviceOwner: 'serviceOwner 3',
            serviceType: 'sometype',
          },
        },
        bffResponseList: [
          {
            rightsKey: 'rightsKey B',
            action: 'action B',
            status: BFFDelegatedStatus.NotDelegated,
            reduxStatus: ReduxStatusResponse.Rejected,
            details: [
              {
                code: 'code B',
                description: 'description B',
              },
            ],
          },
          {
            rightsKey: 'rightsKey C',
            action: 'action C',
            status: BFFDelegatedStatus.NotDelegated,
            reduxStatus: ReduxStatusResponse.Rejected,
            details: [
              {
                code: 'code B',
                description: 'description B',
              },
            ],
          },
          {
            rightsKey: 'rightsKey D',
            action: 'action D',
            status: BFFDelegatedStatus.Delegated,
            details: [
              {
                code: 'code D',
                description: 'description D',
              },
            ],
          },
        ],
      },
      {
        meta: {
          to: {
            id: '123',
            value: 'Ola Nordmann',
          },
          rights: [
            {
              resource: {
                id: '456',
                value: 'service_4',
              },
              action: 'action 4',
            },
          ],
          serviceDto: {
            serviceTitle: 'serviceTitle 4',
            serviceOwner: 'serviceOwner 4',
            serviceType: 'sometype',
          },
        },
        bffResponseList: [
          {
            rightsKey: 'rightsKey B',
            action: 'action B',
            status: BFFDelegatedStatus.NotDelegated,
            details: [
              {
                code: 'code B',
                description: 'description B',
              },
            ],
          },
          {
            rightsKey: 'rightsKey D',
            action: 'action D',
            status: BFFDelegatedStatus.NotDelegated,
            details: [
              {
                code: 'code D',
                description: 'description D',
              },
            ],
          },
        ],
      },
    ],
  },
};
