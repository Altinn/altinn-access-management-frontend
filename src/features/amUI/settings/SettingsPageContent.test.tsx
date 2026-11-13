import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Environment } from '@/resources/utils/pathUtils';

import { SettingsPageContent } from './SettingsPageContent';

let orgNumber: string;
let env: Environment;
const addressesQuery = vi.fn();

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
}));

vi.mock('@/resources/hooks/useDocumentTitle', () => ({ useDocumentTitle: vi.fn() }));

vi.mock('@/rtk/features/settingsApi', () => ({
  useGetOrgNotificationAddressesQuery: (...args: unknown[]) => addressesQuery(...args) as never,
}));

vi.mock('@/resources/utils/pathUtils', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getEnv: () => env,
}));

vi.mock('@/rtk/features/userInfoApi', () => ({
  useGetIsCompanyProfileAdminQuery: () => ({ data: true, isLoading: false }),
  useGetReporteeQuery: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    actingParty: { organizationIdentifier: orgNumber, name: 'Org' },
    isLoading: false,
  }),
}));

vi.mock('../common/ReporteePageHeading/ReporteePageHeading', () => ({
  ReporteePageHeading: () => null,
}));

vi.mock('./SettingsServiceAnnouncement', () => ({ SettingsServiceAnnouncement: () => null }));

vi.mock('./SettingsModal', () => ({
  SettingsModal: () => <div data-testid='settings-modal' />,
}));

describe('SettingsPageContent', () => {
  beforeEach(() => {
    orgNumber = '312345678';
    env = Environment.AT22;
    addressesQuery.mockReset();
    addressesQuery.mockReturnValue({ data: undefined, isLoading: false, error: undefined });
  });

  it('keeps the dialog mounted when reading the addresses fails', () => {
    addressesQuery.mockReturnValue({
      data: [{ notificationAddressId: '1', email: 'first@example.com' }],
      isLoading: false,
      error: { status: 500, data: null },
    });
    render(<SettingsPageContent />);

    expect(screen.getByTestId('settings-addresses-error')).toBeTruthy();
    expect(screen.getByTestId('settings-modal')).toBeTruthy();
  });

  it('explains instead of opening the address dialog for an organization outside Tenor', async () => {
    orgNumber = '912345678';
    render(<SettingsPageContent />);

    await userEvent.click(screen.getByRole('button', { name: /settings_page.alerts_on_email/ }));

    expect(
      screen.getByRole('dialog', {
        name: 'settings_page.notifications_not_supported_heading',
        hidden: true,
      }),
    ).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'common.close', hidden: true })).toHaveLength(2);
    expect(screen.queryByTestId('settings-modal')).toBeNull();
    expect(addressesQuery).toHaveBeenCalledWith('912345678', { skip: true });
  });

  it('opens the address dialog for an organization outside Tenor in production', () => {
    orgNumber = '912345678';
    env = Environment.PROD;
    render(<SettingsPageContent />);

    expect(screen.getByTestId('settings-modal')).toBeTruthy();
    expect(addressesQuery).toHaveBeenCalledWith('912345678', { skip: false });
  });
});
