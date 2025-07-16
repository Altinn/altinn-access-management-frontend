import type { Meta, StoryObj } from '@storybook/react-vite';

import { NavigationSection } from './NavigationSection';

type NavigationSectionPropsAndCustomArgs = React.ComponentProps<typeof NavigationSection>;

const exampleArgs: NavigationSectionPropsAndCustomArgs = {
  nextButtonProps: {
    onNext: () => console.log('Next button clicked'),
    disabled: false,
  },
  cancelButtonProps: {
    onCancel: () => console.log('Cancel button clicked'),
    showWarning: true,
  },
};

export default {
  title: 'Features/SingleRight/NavigationSection',
  component: NavigationSection,
  argTypes: {},
} as Meta;

export const Default: StoryObj<NavigationSectionPropsAndCustomArgs> = {
  args: exampleArgs,
};
