import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@digdir/designsystemet-react';
import { MinusCircleIcon } from '@navikt/aksel-icons';

import { ActionBar } from '../ActionBar';

import { CollectionBar } from './CollectionBar';

type CollectionBarPropsAndCustomArgs = React.ComponentProps<typeof CollectionBar>;

const sampleList: {
  key: number;
  title: string;
  subtitle: string;
  color: 'success' | 'warning' | 'danger';
}[] = [
  {
    key: 1,
    title: 'Resource 1',
    subtitle: 'Owner 1',
    color: 'success',
  },
  {
    key: 2,
    title: 'Resource 2',
    subtitle: 'Owner 2',
    color: 'warning',
  },
  {
    key: 3,
    title: 'Resource 3',
    subtitle: 'Owner 3',
    color: 'danger',
  },
  {
    key: 4,
    title: 'Resource 4',
    subtitle: 'Owner 4',
    color: 'success',
  },
];

const exampleCollection = sampleList.map((item) => (
  <ActionBar
    key={item.key}
    title={item.title}
    subtitle={item.subtitle}
    color={item.color}
    actions={
      <Button
        variant='tertiary'
        size={'sm'}
        onClick={() => console.log('Remove')}
        icon
      >
        <MinusCircleIcon />
      </Button>
    }
  />
));

const exampleArgs: CollectionBarPropsAndCustomArgs = {
  compact: false,
  disabledProceedButton: false,
  title: 'Title',
  color: 'neutral',
  proceedToPath: '/path',
  collection: exampleCollection,
};

export default {
  title: 'Components/CollectionBar',
  component: CollectionBar,
  argTypes: {
    color: {
      options: ['light', 'dark', 'neutral', 'warning', 'success', 'danger'],
      control: { type: 'radio' },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
      <CollectionBar
        {...exampleArgs}
        {...args}
      />
    </div>
  ),
} as Meta;

export const Default: StoryObj<CollectionBarPropsAndCustomArgs> = {
  args: exampleArgs,
};
