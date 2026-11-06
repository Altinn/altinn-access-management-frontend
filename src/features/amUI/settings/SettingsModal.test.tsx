import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type NotificationAddress, settingsApi } from '@/rtk/features/settingsApi';

import { SettingsModal } from './SettingsModal';

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({ actingParty: { organizationIdentifier: '123456789' } }),
}));

const emailAddress = (id: number, email: string) =>
  ({ notificationAddressId: id, email }) as unknown as NotificationAddress;

const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

let serverAddresses: NotificationAddress[];
let postResponses: Response[];

const renderModal = (mode: 'email' | 'sms' = 'email', canDeleteLastAddress = true) => {
  const store = configureStore({
    reducer: { [settingsApi.reducerPath]: settingsApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(settingsApi.middleware),
  });

  render(
    <Provider store={store}>
      <SettingsModal
        mode={mode}
        open
        canDeleteLastAddress={canDeleteLastAddress}
        onClose={vi.fn()}
      />
    </Provider>,
  );
};

const saveButton = () => screen.getByRole('button', { name: 'common.save_changes', hidden: true });
const field = (number: number) =>
  screen.getByRole('textbox', {
    name: `settings_page.address_number {"number":${number}}`,
    hidden: true,
  });
const phoneField = (number: number) =>
  screen.getByRole('textbox', {
    name: `settings_page.phone_number {"number":${number}}`,
    hidden: true,
  });
const addRowButton = () =>
  screen.getByRole('button', { name: 'settings_page.add_more', hidden: true });

describe('SettingsModal', () => {
  beforeEach(() => {
    serverAddresses = [emailAddress(1, 'first@example.com')];
    postResponses = [];

    vi.stubGlobal(
      'fetch',
      vi.fn((request: Request) =>
        Promise.resolve(
          request.method === 'GET'
            ? respond(200, serverAddresses)
            : (postResponses.shift() ?? respond(200, {})),
        ),
      ),
    );
  });

  it('shows a Norwegian phone number that Core rejects as invalid when leaving the field', async () => {
    serverAddresses = [];
    renderModal('sms');
    const user = userEvent.setup();

    await user.type(await waitFor(() => phoneField(1)), '12345678');
    await user.tab();

    expect(screen.getByText('text_field_errors.invalid_norwegian_phone')).toBeTruthy();
    expect(saveButton()).toHaveProperty('disabled', true);
  });

  it('shows the error on the row that failed and keeps what the user typed', async () => {
    renderModal();
    const user = userEvent.setup();
    await waitFor(() => expect(field(1)).toHaveProperty('value', 'first@example.com'));

    await user.click(addRowButton());
    await user.type(field(2), 'second@example.com');
    await user.click(addRowButton());
    await user.type(field(3), 'third@example.com');

    // The first new address is saved and the second is rejected, so the refetch returns a new list
    postResponses = [
      respond(201, emailAddress(2, 'second@example.com')),
      respond(400, { code: 'STUI-00000' }),
    ];
    serverAddresses = [emailAddress(1, 'first@example.com'), emailAddress(2, 'second@example.com')];
    await user.click(saveButton());

    expect(await screen.findByText('text_field_errors.invalid_email_pattern')).toBeTruthy();
    expect(field(2)).toHaveProperty('value', 'second@example.com');
    expect(field(3)).toHaveProperty('value', 'third@example.com');
    expect(screen.queryByText('settings_page.error_saving_addresses')).toBeNull();
  });

  it('removes the row error when the user corrects the address', async () => {
    renderModal();
    const user = userEvent.setup();
    await waitFor(() => expect(field(1)).toHaveProperty('value', 'first@example.com'));

    await user.click(addRowButton());
    await user.type(field(2), 'second@example.com');
    postResponses = [respond(400, { code: 'STUI-00000' })];
    await user.click(saveButton());
    await screen.findByText('text_field_errors.invalid_email_pattern');

    await user.type(field(2), 'x');

    expect(screen.queryByText('text_field_errors.invalid_email_pattern')).toBeNull();
  });

  it('shows why the organization cannot get addresses when it is not in ER', async () => {
    serverAddresses = [];
    renderModal('email', true);
    const user = userEvent.setup();

    await user.type(await waitFor(() => field(1)), 'first@example.com');
    postResponses = [respond(400, { code: 'STUI-00003' })];
    await user.click(saveButton());

    expect(await screen.findByText('settings_page.organization_not_in_er')).toBeTruthy();
    expect(field(1)).toHaveProperty('value', 'first@example.com');
  });

  it('marks a row that repeats another address without sending anything', async () => {
    renderModal();
    const user = userEvent.setup();
    await waitFor(() => expect(field(1)).toHaveProperty('value', 'first@example.com'));

    await user.click(addRowButton());
    await user.type(field(2), 'FIRST@example.com');
    await user.click(saveButton());

    expect(screen.getByText('settings_page.address_already_exists')).toBeTruthy();
    expect(
      vi.mocked(fetch).mock.calls.every(([request]) => (request as Request).method === 'GET'),
    ).toBe(true);
  });

  it('refuses to save when every row is empty and no other address remains', async () => {
    renderModal('email', false);
    const user = userEvent.setup();
    await waitFor(() => expect(field(1)).toHaveProperty('value', 'first@example.com'));

    await user.click(addRowButton());
    await user.clear(field(1));

    expect(screen.getByText('settings_page.no_addresses_error')).toBeTruthy();
    expect(saveButton()).toHaveProperty('disabled', true);
  });
});
