import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { RootProvider } from '@altinn/altinn-components';
import { Provider } from 'react-redux';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { RestoreFocusProvider, useRestoreFocus } from '../common/RestoreFocus';

import { PendingRequests } from './RequestsTabPanel';
import { SentRequestsTabPanel } from './SentRequestsTabPanel';
import type { Request } from './types';

import store from '@/rtk/app/store';

const accessRequest = (id: string, name: string, overrides: Partial<Request> = {}): Request => ({
  id,
  type: 'accessrequest',
  createdDate: '2025-04-03T10:00:00Z',
  displayPartyName: name,
  displayPartyType: 'person',
  partyUuid: `party-${id}`,
  numberOfRequests: 5,
  ...overrides,
});

const pendingReceived: Request[] = [
  accessRequest('1', 'Annema Figma', { createdDate: '2025-04-01T10:00:00Z' }),
  accessRequest('2', 'Sara Slemdal', { createdDate: '2025-04-02T10:00:00Z' }),
  accessRequest('3', 'Helle Hansen'),
  accessRequest('4', 'Holly Hansen'),
  accessRequest('5', 'Hanne Hansen'),
  accessRequest('6', 'Lorem AS', {
    displayPartyType: 'company',
    organizationIdentifier: '912345678',
    numberOfRequests: 2,
  }),
  accessRequest('7', 'Lorem AS avd. Bergen', {
    displayPartyType: 'company',
    organizationIdentifier: '998765432',
    isSubUnit: true,
    numberOfRequests: 1,
  }),
  {
    id: '8',
    type: 'consent',
    createdDate: '2025-04-04T10:00:00Z',
    displayPartyName: 'Ipsum Bank ASA',
    displayPartyType: 'company',
    description: 'request_page.request_consent',
  },
  {
    id: '9',
    type: 'systemuser',
    createdDate: '2025-04-05T10:00:00Z',
    displayPartyName: 'Fiken',
    displayPartyType: 'system',
    description: 'request_page.request_systemuser',
  },
  accessRequest('10', 'Jørgen Ranstad', { numberOfRequests: 1 }),
];

const handledReceived: Request[] = [
  accessRequest('h1', 'Sara Slemdal', { numberOfRequests: 2 }),
  accessRequest('h2', 'Johannes Jøvik', { numberOfRequests: 8 }),
  accessRequest('h3', 'Mari Slemdal', { numberOfRequests: 3 }),
  accessRequest('h4', 'Dolor Sit AS', {
    displayPartyType: 'company',
    organizationIdentifier: '910000001',
    numberOfRequests: 1,
  }),
];

const pendingSent: Request[] = [
  accessRequest('s1', 'Consectetur AS', {
    displayPartyType: 'company',
    organizationIdentifier: '920000002',
    numberOfRequests: 3,
  }),
  accessRequest('s2', 'Kari Nordmann', { numberOfRequests: 1 }),
];

const handledSent: Request[] = [
  accessRequest('sh1', 'Adipiscing AS', {
    displayPartyType: 'company',
    organizationIdentifier: '930000003',
    numberOfRequests: 2,
  }),
];

const Wrapper = ({ children }: { children: ReactNode }) => {
  const restoreFocus = useRestoreFocus();
  return (
    <Provider store={store}>
      <RootProvider>
        <PartyRepresentationProvider
          fromPartyUuid='test-uuid'
          actingPartyUuid='test-uuid'
        >
          <RestoreFocusProvider restoreFocus={restoreFocus}>
            <div style={{ padding: 24, maxWidth: 800 }}>{children}</div>
          </RestoreFocusProvider>
        </PartyRepresentationProvider>
      </RootProvider>
    </Provider>
  );
};

interface StoryArgs {
  pendingRequests: Request[];
  handledRequests: Request[];
  direction: 'received' | 'sent';
}

const RequestsPanelStory = ({ pendingRequests, handledRequests, direction }: StoryArgs) => {
  const Panel = direction === 'sent' ? SentRequestsTabPanel : PendingRequests;
  return (
    <Wrapper>
      <Panel
        pendingRequests={pendingRequests}
        handledRequests={handledRequests}
      />
    </Wrapper>
  );
};

const meta: Meta<StoryArgs> = {
  title: 'Features/AMUI/RequestsTabPanel',
  render: (args) => <RequestsPanelStory {...args} />,
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Received: Story = {
  args: {
    pendingRequests: pendingReceived,
    handledRequests: handledReceived,
    direction: 'received',
  },
};

export const Sent: Story = {
  args: {
    pendingRequests: pendingSent,
    handledRequests: handledSent,
    direction: 'sent',
  },
};

export const ReceivedWithoutHandled: Story = {
  args: {
    pendingRequests: pendingReceived,
    handledRequests: [],
    direction: 'received',
  },
};

export const Mobile: Story = {
  args: {
    pendingRequests: pendingReceived,
    handledRequests: handledReceived,
    direction: 'received',
  },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
