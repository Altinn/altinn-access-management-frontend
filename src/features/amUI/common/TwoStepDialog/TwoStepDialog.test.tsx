import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TwoStepDialog } from './TwoStepDialog';
import type { RestoreFocus } from '../RestoreFocus';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createRestoreFocus = (): RestoreFocus => ({
  requestFocus: vi.fn(),
  focusRequestId: null,
  focusFallbackId: null,
  clearRequest: vi.fn(),
});

const renderDialog = (props: Partial<React.ComponentProps<typeof TwoStepDialog>> = {}) =>
  render(
    <TwoStepDialog
      title='Modal title'
      isDetailView={false}
      onBack={vi.fn()}
      onClose={vi.fn()}
      restoreFocus={createRestoreFocus()}
      {...props}
    >
      <div>view content</div>
    </TwoStepDialog>,
  );

describe('TwoStepDialog', () => {
  // The dialog is rendered closed (opened imperatively by callers), so its contents are in the
  // accessibility tree as hidden — queries opt in with `hidden: true`.
  it('shows the static title and content in the primary view without a back button', () => {
    renderDialog({ isDetailView: false });

    expect(screen.getByRole('heading', { name: 'Modal title', hidden: true })).toBeInTheDocument();
    expect(screen.getByText('view content')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'common.back', hidden: true }),
    ).not.toBeInTheDocument();
  });

  it('keeps the same title visible and shows a back button in the detail view', () => {
    renderDialog({ isDetailView: true });

    expect(screen.getByRole('heading', { name: 'Modal title', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.back', hidden: true })).toBeInTheDocument();
  });

  it('calls onBack when the back button is pressed', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderDialog({ isDetailView: true, onBack });

    await user.click(screen.getByRole('button', { name: 'common.back', hidden: true }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
