import React from 'react';
import type { Meta, StoryObj } from '@storybook/react/*';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { ApiActionBar } from './ApiActionBar';

type ApiActionBarPropsAndCustomArgs = React.ComponentProps<typeof ApiActionBar>;

export default {
  title: 'Features/Api delegation/ApiActionBar',
  component: ApiActionBar,
  render: (args) => (
    <Provider store={store}>
      <ApiActionBar {...(args as ApiActionBarPropsAndCustomArgs)} />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {
    variant: 'add',
    api: {
      identifier: 'appid-402',
      apiName: 'Det magiske klesskapet',
      orgName: 'NARNIA',
      rightDescription: 'Gir tilgang til Narnia.',
      homepage: null,
      status: null,
      spatial: null,
      contactPoints: [
        {
          category: 'Some category',
          email: 'email@someemaildigdir.no',
          telephone: '12345678',
          contactPage: 'Some page (webpage maybe?)',
        },
      ],
      delegable: true,
      visible: true,
      resourceOwnerName: 'NARNIA',
      resourceOwnerOrgNumber: '777777777',
      priorityCounter: null,
      resourceType: 'MaskinportenSchema',
      authorizationReference: [
        {
          id: 'urn:altinn:resource',
          value: 'appid-402',
        },
      ],
      keywords: [],
      isLoading: false,
    },
    onAdd: () => console.log('onAdd'),
    onRemove: () => console.log('onRemove'),
  },
  argTypes: {
    variant: { control: { type: 'inline-radio', optopns: ['add', 'remove'] } },
    onRemove: { control: { disabled: true } },
    onAdd: { control: { disabled: true } },
  },
};
