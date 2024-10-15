import type { Meta, StoryObj } from '@storybook/react';

import { RightsActionBarContent } from './RightsActionBarContent';

export default {
  title: 'Features/SingleRight/ChooseRightsPage/RightsActionBarContent',
  component: RightsActionBarContent,
} as Meta;

export const Default: StoryObj = {
  args: {
    toggleRight: (serviceIdentifier: string, action: string) => {
      console.log(serviceIdentifier, action);
    },
    serviceDescription: 'Service description',
    rightDescription: 'Right description',
    serviceIdentifier: 'serviceIdentifier',
    serviceType: 'serviceType',
    rights: [
      {
        action: 'action A',
        rightKey: 'rightKey A',
        delegable: true,
        checked: true,
        resourceReference: [
          {
            id: 'id A',
            value: 'value A',
          },
        ],
        details: [
          {
            code: 'code',
            description: 'description',
          },
        ],
      },
      {
        action: 'action B',
        rightKey: 'rightKey B',
        delegable: true,
        checked: false,
      },
      {
        action: 'action C',
        rightKey: 'rightKey C',
        delegable: false,
        checked: false,
      },
    ],
  },
};
