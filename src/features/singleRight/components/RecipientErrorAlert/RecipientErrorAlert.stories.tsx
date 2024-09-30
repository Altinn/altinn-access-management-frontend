import type { Meta, StoryObj } from '@storybook/react';
import { BugIcon } from '@navikt/aksel-icons';

import { Page, PageContent, PageHeader } from '@/components';

import { RecipientErrorAlert } from './RecipientErrorAlert';

type RecipientErrorAlertPropsAndCustomArgs = React.ComponentProps<typeof RecipientErrorAlert>;

export default {
  title: 'Features/SingleRight/RecipientErrorAlert',
  component: RecipientErrorAlert,
  render: (args) => (
    <Page
      color='danger'
      size={'medium'}
    >
      <PageHeader icon={<BugIcon />}>Det har oppstått en feil!</PageHeader>
      <PageContent>
        <RecipientErrorAlert {...(args as RecipientErrorAlertPropsAndCustomArgs)} />
      </PageContent>
    </Page>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {
    userUUID: '123',
    partyUUID: '123',
  },
  argTypes: {
    userUUID: { control: { type: 'text' } },
    partyUUID: { control: { type: 'text' } },
  },
};
