import type { Meta, StoryObj } from '@storybook/react';
import {
  AirplaneIcon,
  BicycleIcon,
  BoatIcon,
  CarIcon,
  MotorcycleIcon,
  RocketIcon,
  TruckIcon,
} from '@navikt/aksel-icons';

import { CompactDeletableListItem, ListTextColor } from './CompactDeletableListItem';

type CompactDeletableListItemPropsAndCustomArgs = React.ComponentProps<
  typeof CompactDeletableListItem
>;

const exampleArgs: CompactDeletableListItemPropsAndCustomArgs = {
  contentColor: ListTextColor.primary,
  middleText: 'Middle text',
  leftText: 'Left text',
  removeCallback: () => console.log('Remove callback'),
};

export default {
  title: 'Components/CompactDeletableListItem',
  component: CompactDeletableListItem,
  argTypes: {
    contentColor: {
      options: [ListTextColor.primary, ListTextColor.error],
      control: { type: 'radio' },
    },
    removeCallback: { control: { disable: true } },
    children: { control: { disable: true } },
    startIcon: { control: { disable: true } },
  },
  render: (args) => (
    <ul style={{}}>
      <CompactDeletableListItem
        startIcon={<AirplaneIcon />}
        {...args}
        leftText='Airplane'
      />
      <CompactDeletableListItem
        startIcon={<BicycleIcon />}
        {...args}
        leftText='Bicycle'
      />
      <CompactDeletableListItem
        startIcon={<BoatIcon />}
        {...exampleArgs}
        {...args}
      />
      <CompactDeletableListItem
        startIcon={<CarIcon />}
        {...exampleArgs}
        {...args}
      />
      <CompactDeletableListItem
        startIcon={<MotorcycleIcon />}
        {...exampleArgs}
        {...args}
      />
      <CompactDeletableListItem
        startIcon={<RocketIcon />}
        {...exampleArgs}
        {...args}
      />
      <CompactDeletableListItem
        startIcon={<TruckIcon />}
        {...exampleArgs}
        {...args}
      />
    </ul>
  ),
} as Meta;

export const Default: StoryObj<CompactDeletableListItemPropsAndCustomArgs> = {
  args: exampleArgs,
};
