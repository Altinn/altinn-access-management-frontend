import type { Meta, StoryObj } from '@storybook/react';

import { ReduxStatusResponse } from '@/rtk/features/singleRights/singleRightsSlice';

import { ReceiptActionBarContent } from './ReceiptActionBarContent';

export default {
  title: 'Features/SingleRight/ReceiptPage/ReceiptActionBarContent',
  component: ReceiptActionBarContent,
} as Meta;

export const Default: StoryObj = {
  args: {
    failedDelegations: [
      {
        rightsKey: 'rightsKey A',
        action: 'action A',
        status: 'status A',
        ReduxStatusResponse: ReduxStatusResponse.Rejected,
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
        status: 'status C',
        ReduxStatusResponse: ReduxStatusResponse.Rejected,
        details: [
          {
            code: 'code C',
            description: 'description C',
          },
        ],
      },
    ],
    successfulDelegations: [
      {
        rightsKey: 'rightsKey B',
        action: 'action B',
        status: 'status B',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
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
        status: 'status D',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
        details: [
          {
            code: 'code D',
            description: 'description D',
          },
        ],
      },
    ],
    isRejectedDelegation: true,
    index: 1,
    serviceType: 'serviceType',
  },
};

export const AltinnApp: StoryObj = {
  args: {
    failedDelegations: [
      {
        rightsKey: 'rightsKey A',
        action: 'action A',
        status: 'status A',
        ReduxStatusResponse: ReduxStatusResponse.Rejected,
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
        status: 'status C',
        ReduxStatusResponse: ReduxStatusResponse.Rejected,
        details: [
          {
            code: 'code C',
            description: 'description C',
          },
        ],
      },
    ],
    successfulDelegations: [
      {
        rightsKey: 'rightsKey B',
        action: 'action B',
        status: 'status B',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
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
        status: 'status D',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
        details: [
          {
            code: 'code D',
            description: 'description D',
          },
        ],
      },
    ],
    isRejectedDelegation: true,
    index: 1,
    serviceType: 'AltinnApp',
  },
};

export const AllGood: StoryObj = {
  args: {
    successfulDelegations: [
      {
        rightsKey: 'rightsKey B',
        action: 'action B',
        status: 'status B',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
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
        status: 'status D',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
        details: [
          {
            code: 'code D',
            description: 'description D',
          },
        ],
      },
    ],
    isRejectedDelegation: false,
    index: 1,
    serviceType: '',
  },
};

export const AllBad: StoryObj = {
  args: {
    failedDelegations: [
      {
        rightsKey: 'rightsKey B',
        action: 'action B',
        status: 'status B',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
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
        status: 'status D',
        ReduxStatusResponse: ReduxStatusResponse.Fulfilled,
        details: [
          {
            code: 'code D',
            description: 'description D',
          },
        ],
      },
    ],
    isRejectedDelegation: true,
    index: 1,
    serviceType: '',
  },
};

export const isRejectedDelegation: StoryObj = {
  args: {
    failedDelegations: [],
    isRejectedDelegation: true,
    index: 1,
    serviceType: '',
  },
};
