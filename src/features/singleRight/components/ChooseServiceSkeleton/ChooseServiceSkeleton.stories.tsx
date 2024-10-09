import type { Meta, StoryObj } from '@storybook/react';
import { MugIcon } from '@navikt/aksel-icons';

import { Page, PageContent, PageHeader } from '@/components';

import { ChooseServiceSkeleton } from './ChooseServiceSkeleton';

export default {
  title: 'Features/SingleRight/ChooseServiceSkeleton',
  component: ChooseServiceSkeleton,
} as Meta;

export const Default: StoryObj = {
  render: () => (
    <Page
      color='dark'
      size={'medium'}
    >
      <PageHeader icon={<MugIcon />}>Laster...</PageHeader>
      <PageContent>
        <ChooseServiceSkeleton />
      </PageContent>
    </Page>
  ),
};
