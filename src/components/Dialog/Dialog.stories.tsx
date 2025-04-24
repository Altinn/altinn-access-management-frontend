import type { Meta, StoryObj } from '@storybook/react';
import { DsParagraph } from '@altinn/altinn-components';

import { Dialog } from './Dialog';
import { DialogContent } from './DialogContent';

type DialogPropsAndCustomArgs = React.ComponentProps<typeof Dialog>;

const exampleArgs = {
  open: true,
  onClose: () => console.log('Close button clicked'),
};

export default {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
  },
  render: (args) => {
    return (
      <Dialog
        {...exampleArgs}
        {...args}
      >
        <DialogContent>
          <DsParagraph
            variant='long'
            data-size='sm'
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus orci turpis, vehicula a
            dignissim eget, condimentum at diam. Etiam iaculis, purus vel venenatis condimentum,
            lectus arcu tempor est, et tempor lorem elit ut nunc. Donec eu bibendum leo. Ut ac dolor
            erat. Vestibulum posuere fringilla iaculis
          </DsParagraph>
        </DialogContent>
      </Dialog>
    );
  },
} as Meta;

export const BasicDialog: StoryObj<DialogPropsAndCustomArgs> = {
  args: exampleArgs,
};
