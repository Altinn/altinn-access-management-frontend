import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SettingsPageContent } from './SettingsPageContent';

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
}));

vi.mock('@/resources/hooks/useDocumentTitle', () => ({ useDocumentTitle: vi.fn() }));

vi.mock('@/rtk/features/settingsApi', () => ({
  useGetOrgNotificationAddressesQuery: () => ({
    data: [{ notificationAddressId: '1', email: 'first@example.com' }],
    isLoading: false,
    error: { status: 500, data: null },
  }),
}));

vi.mock('@/rtk/features/userInfoApi', () => ({
  useGetIsCompanyProfileAdminQuery: () => ({ data: true, isLoading: false }),
  useGetReporteeQuery: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('../common/PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({
    actingParty: { organizationIdentifier: '123456789', name: 'Org' },
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
  it('keeps the dialog mounted when reading the addresses fails', () => {
    render(<SettingsPageContent />);

    expect(screen.getByTestId('settings-addresses-error')).toBeTruthy();
    expect(screen.getByTestId('settings-modal')).toBeTruthy();
  });
});
