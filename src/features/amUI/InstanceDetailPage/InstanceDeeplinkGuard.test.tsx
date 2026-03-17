import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { InstanceDeeplinkGuard } from './InstanceDeeplinkGuard';
import { useInstanceDeeplinkReporteeGuard } from './useInstanceDeeplinkReporteeGuard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('./useInstanceDeeplinkReporteeGuard', async () => {
  const actual = await vi.importActual('./useInstanceDeeplinkReporteeGuard');
  return {
    ...actual,
    useInstanceDeeplinkReporteeGuard: vi.fn(),
  };
});

describe('InstanceDeeplinkGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders children when guard is ready', () => {
    vi.mocked(useInstanceDeeplinkReporteeGuard).mockReturnValue({
      status: 'ready',
      error: undefined,
    });

    render(
      <MemoryRouter initialEntries={['/poa-overview/instance?dialogId=dialog-123']}>
        <InstanceDeeplinkGuard backUrl='/poa-overview'>
          <div>instance content</div>
        </InstanceDeeplinkGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText('instance content')).toBeInTheDocument();
  });

  test('renders title-only warning and inbox link when access is missing', () => {
    vi.mocked(useInstanceDeeplinkReporteeGuard).mockReturnValue({
      status: 'unauthorized',
      error: undefined,
    });

    render(
      <MemoryRouter initialEntries={['/poa-overview/instance']}>
        <InstanceDeeplinkGuard backUrl='/poa-overview'>
          <div>instance content</div>
        </InstanceDeeplinkGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText('instance_detail_page.reportee_access_missing_title')).toBeVisible();
    expect(screen.queryByText('instance content')).not.toBeInTheDocument();

    const inboxLink = screen.getByRole('link', { name: /instance_detail_page.back_to_inbox/i });
    expect(inboxLink).toHaveAttribute('href', 'https://af.altinn.no/inbox');
  });
});
