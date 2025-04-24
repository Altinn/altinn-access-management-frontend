import type { Meta, StoryObj } from '@storybook/react';
import { PencilIcon, TrashIcon } from '@navikt/aksel-icons';
import { DsParagraph, DsButton } from '@altinn/altinn-components';

import { ActionBar } from './ActionBar';

type ActionbarPropsAndCustomArgs = React.ComponentProps<typeof ActionBar>;

const ExampleActions = (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <DsButton
      variant='tertiary'
      data-color='accent'
      data-size='md'
      icon
      onClick={() => console.log('Edit')}
    >
      <PencilIcon />
    </DsButton>
    <DsButton
      variant='tertiary'
      data-color='danger'
      data-size='md'
      icon
      onClick={() => console.log('Delete')}
    >
      <TrashIcon />
    </DsButton>
  </div>
);

const exampleArgs: ActionbarPropsAndCustomArgs = {
  title: 'Title',
  subtitle: 'Subtitle',
  additionalText: 'Additional Text',
  color: 'neutral',
  defaultOpen: true,
  actions: ExampleActions,
  children: (
    <DsParagraph variant='long'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </DsParagraph>
  ),
};

export default {
  title: 'Components/ActionBar',
  component: ActionBar,
  argTypes: {
    actions: { control: { disable: true } },
    color: {
      options: ['light', 'dark', 'neutral', 'warning', 'success', 'danger'],
      control: { type: 'radio' },
    },
    size: {
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' },
    },
    children: { control: { disable: true } },
  },
} as Meta;

export const Default: StoryObj<ActionbarPropsAndCustomArgs> = {
  args: exampleArgs,
};
