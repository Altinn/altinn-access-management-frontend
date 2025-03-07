import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import React from 'react';
import { Heading } from '@digdir/designsystemet-react';

import store from '@/rtk/app/store';
import { PageContainer, PageContent, PageHeader } from '@/components';

import { DelegationType } from '../DelegationType';

import { OverviewPageContent } from './OverviewPageContent';
type OverviewPageContentPropsAndCustomArgs = React.ComponentProps<typeof OverviewPageContent>;

export default {
  title: 'Features/Api delegation/OverviewPageContent',
  component: OverviewPageContent,
  render: (args) => (
    <Provider store={store}>
      <OverviewPageContent {...(args as OverviewPageContentPropsAndCustomArgs)} />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {},
  argTypes: {
    delegationType: {
      options: ['Offered', 'Received'],
      control: { type: 'radio' },
    },
  },
};

export const Offered: StoryObj = {
  args: {},
  render: () => (
    <Provider store={store}>
      <PageContainer>
        <PageHeader>
          <Heading
            level={1}
            data-size='sm'
          >
            API
          </Heading>
        </PageHeader>
        <PageContent>
          <OverviewPageContent delegationType={DelegationType.Offered} />
        </PageContent>
      </PageContainer>
    </Provider>
  ),
};

export const Received: StoryObj = {
  args: {},
  render: () => (
    <Provider store={store}>
      <OverviewPageContent delegationType={DelegationType.Received} />
    </Provider>
  ),
};
