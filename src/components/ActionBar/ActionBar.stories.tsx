import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { PencilIcon, TrashIcon } from '@navikt/aksel-icons';
import { Button, Paragraph } from '@digdir/designsystemet-react';

import { ActionBar } from './ActionBar';

type ActionbarPropsAndCustomArgs = React.ComponentProps<typeof ActionBar>;

const ExampleActions = (
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Button
      variant='tertiary'
      color='accent'
      icon
      onClick={fn()}
    >
      <PencilIcon />
    </Button>
    <Button
      variant='tertiary'
      color='danger'
      icon
      onClick={fn()}
    >
      <TrashIcon />
    </Button>
  </div>
);

const exampleArgs: ActionbarPropsAndCustomArgs = {
  title: 'Title',
  subtitle: 'Subtitle',
  additionalText: 'Additional Text',
  color: 'neutral',
  size: 'medium',
  defaultOpen: true,
  actions: ExampleActions,
  children: (
    <Paragraph
      variant='long'
      size='sm'
      spacing={true}
    >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </Paragraph>
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
