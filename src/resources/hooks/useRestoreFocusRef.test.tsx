import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRestoreFocusRef } from './useRestoreFocusRef';

interface FocusTargetTestProps {
  children: React.ReactNode;
  focusTargetId?: string | null;
  shouldRestoreFocus?: boolean;
}

const FocusTargetTest = ({
  children,
  focusTargetId,
  shouldRestoreFocus = true,
}: FocusTargetTestProps) => {
  const { ref, setFocusTargetId } = useRestoreFocusRef<HTMLDivElement>({
    shouldRestoreFocus,
  });

  useEffect(() => {
    setFocusTargetId(focusTargetId ?? null);
  }, [focusTargetId, setFocusTargetId]);

  return <div ref={ref}>{children}</div>;
};

describe('useRestoreFocusRef', () => {
  it('focuses the first focusable descendant of the target element', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <div id='target'>
          <button>Target action</button>
        </div>
      </FocusTargetTest>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Target action' })).toHaveFocus(),
    );
  });

  it('focuses the target element itself when it has no focusable descendants', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <div id='target'>Target content</div>
      </FocusTargetTest>,
    );

    const target = screen.getByText('Target content');
    await waitFor(() => expect(target).toHaveFocus());
    expect(target).not.toHaveAttribute('tabindex');
  });

  it('restores focus once shouldRestoreFocus becomes true', async () => {
    const { rerender } = render(
      <FocusTargetTest
        focusTargetId='target'
        shouldRestoreFocus={false}
      >
        <button id='target'>Target action</button>
      </FocusTargetTest>,
    );

    expect(screen.getByRole('button', { name: 'Target action' })).not.toHaveFocus();

    rerender(
      <FocusTargetTest
        focusTargetId='target'
        shouldRestoreFocus
      >
        <button id='target'>Target action</button>
      </FocusTargetTest>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Target action' })).toHaveFocus(),
    );
  });

  it('does not focus while focus restore is disabled', async () => {
    render(
      <FocusTargetTest
        focusTargetId='target'
        shouldRestoreFocus={false}
      >
        <button id='target'>Disabled target</button>
      </FocusTargetTest>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Disabled target' })).not.toHaveFocus(),
    );
  });
});
