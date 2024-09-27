import type { Meta, StoryObj } from '@storybook/react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { DogIcon } from '@navikt/aksel-icons';

import { Page } from './Page';
import { PageHeader } from './PageHeader';
import { PageContent } from './PageContent';

const exampleArgs = {
  color: 'dark',
  size: 'medium',
  children: (
    <>
      <PageHeader icon={<DogIcon />}>This is a header</PageHeader>
      <PageContent>
        <Heading
          level={2}
          size='md'
        >
          This is a page
        </Heading>
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est
        </Paragraph>
      </PageContent>
    </>
  ),
};

export default {
  title: 'Components/Page',
  component: Page,
  argTypes: {
    color: {
      options: ['dark', 'light', 'success', 'danger'],
      control: { type: 'radio' },
    },
    size: {
      options: ['small', 'medium'],
      control: { type: 'radio' },
    },
    children: { control: { disable: true } },
  },
} as Meta;

export const Default: StoryObj = {
  args: exampleArgs,
};
