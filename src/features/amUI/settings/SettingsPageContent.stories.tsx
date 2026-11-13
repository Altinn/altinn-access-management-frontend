import type { Meta, StoryObj } from '@storybook/react-vite';
import i18n from 'i18next';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';
import { expect, userEvent, within } from 'storybook/test';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { SettingsPageContent } from './SettingsPageContent';

type SettingsPageContentStoryProps = React.ComponentProps<typeof SettingsPageContent>;
type SettingsPageContentStory = StoryObj<SettingsPageContentStoryProps>;

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

const renderSettingsPage = () => (
  <StoryWrapper>
    <PartyRepresentationProvider
      actingPartyUuid={'54f128f7-ca7c-4a57-ad49-3787eb79b506'}
      fromPartyUuid={'54f128f7-ca7c-4a57-ad49-3787eb79b506'}
    >
      <SettingsPageContent />
    </PartyRepresentationProvider>
  </StoryWrapper>
);

// The addresses are the ones .mock/handlers/settings.ts rejects
const saveErrorStory = (email: string, errorKey: string): SettingsPageContentStory => ({
  render: renderSettingsPage,
  parameters: {
    docs: {
      description: {
        story: `Saving the address ${email} fails, and the dialog shows why.`,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('email-address-count');
    await userEvent.click(
      canvas.getByRole('button', {
        name: (name) => name.startsWith(i18n.t('settings_page.alerts_on_email')),
      }),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: i18n.t('settings_page.add_more') }),
    );
    const fields = await canvas.findAllByTestId('email-address');
    await userEvent.type(fields[fields.length - 1], email);
    await userEvent.click(canvas.getByRole('button', { name: i18n.t('common.save_changes') }));

    await expect(await canvas.findByText(i18n.t(errorKey))).toBeInTheDocument();
  },
});

export default {
  title: 'Features/AMUI/Settings/SettingsPageContent',
  component: SettingsPageContent,
} as Meta<SettingsPageContentStoryProps>;

export const OrganizationWithMultipleAddresses: SettingsPageContentStory = {
  render: renderSettingsPage,
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

export const SaveErrorInvalidAddress = saveErrorStory(
  'invalid@example.com',
  'text_field_errors.invalid_email_pattern',
);

export const SaveErrorAddressAlreadyExists = saveErrorStory(
  'duplicate@example.com',
  'settings_page.address_already_exists',
);

export const SaveErrorOrganizationNotInEr = saveErrorStory(
  'not-in-er@example.com',
  'settings_page.organization_not_in_er',
);

export const SaveErrorNotAuthorized = saveErrorStory(
  'forbidden@example.com',
  'settings_page.not_authorized_error',
);

export const SaveErrorTechnical = saveErrorStory(
  'error@example.com',
  'settings_page.error_saving_addresses',
);
