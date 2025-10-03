import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { SettingsPageContent } from './SettingsPageContent';

type SettingsPageContentStoryProps = React.ComponentProps<typeof SettingsPageContent>;

// Helper to wrap each story with necessary providers
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Provider store={store}>
    <RootProvider>{children}</RootProvider>
  </Provider>
);

export default {
  title: 'Features/AMUI/Settings/SettingsPageContent',
  component: SettingsPageContent,
} as Meta<SettingsPageContentStoryProps>;

export const OrganizationWithMultipleAddresses: StoryObj<SettingsPageContentStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        actingPartyUuid={'54f128f7-ca7c-4a57-ad49-3787eb79b506'}
        fromPartyUuid={'54f128f7-ca7c-4a57-ad49-3787eb79b506'}
      >
        <SettingsPageContent />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Settings page for an organization with multiple notification addresses. Shows badges indicating the number of configured addresses.',
      },
    },
  },
};
