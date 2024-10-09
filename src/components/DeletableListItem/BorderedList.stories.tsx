import type { Meta, StoryObj } from '@storybook/react';

import { DeletableListItem } from './DeletableListItem';

type DeletableListItemPropsAndCustomArgs = React.ComponentProps<typeof DeletableListItem>;

const items = [
  {
    id: '1',
    apiName: 'Delegert API A',
    owner: 'Owner',
    description: 'Description',
    scopes: ['some-scope'],
    isSoftDelete: false,
  },
  {
    id: '2',
    apiName: 'Delegert API B',
    owner: 'Owner',
    description: 'Description',
    scopes: ['some-scope'],
    isSoftDelete: false,
  },
  {
    id: '3',
    apiName: 'Delegert API C',
    owner: 'Owner',
    description: 'Description',
    scopes: ['some-scope'],
    isSoftDelete: true,
  },
  {
    id: '4',
    apiName: 'Delegert API D',
    owner: 'Owner',
    description: 'Description',
    scopes: ['some-scope'],
    isSoftDelete: true,
  },
];

const exampleArgs = {
  softDeleteCallback: () => console.log('Soft delete callback'),
  softRestoreCallback: () => console.log('Soft restore callback'),
  isEditable: false,
};

export default {
  title: 'Components/DeletableListItem',
  component: DeletableListItem,
  argTypes: {
    isEditable: { control: { type: 'boolean' } },
    removeCallback: { control: { disable: true } },
    item: { control: { disable: true } },
    scopes: { control: { disable: true } },
  },
  render: (args) => (
    <ul style={{}}>
      {items.map((item) => (
        <DeletableListItem
          key={item.id}
          {...exampleArgs}
          {...args}
          checkIfItemOfOrgIsSoftDeleted={() => item.isSoftDelete && args.isEditable}
          item={item}
        />
      ))}
    </ul>
  ),
} as Meta;

export const Default: StoryObj<DeletableListItemPropsAndCustomArgs> = {
  args: exampleArgs,
};
