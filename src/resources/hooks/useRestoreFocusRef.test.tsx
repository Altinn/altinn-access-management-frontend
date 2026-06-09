import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRestoreFocusRef } from './useRestoreFocusRef';

interface FocusTargetTestProps {
  children: React.ReactNode;
  focusTargetId?: string | null;
  onFocusRestored?: () => void;
  shouldRestoreFocus?: boolean;
}

const FocusTargetTest = ({
  children,
  focusTargetId,
  onFocusRestored,
  shouldRestoreFocus = true,
}: FocusTargetTestProps) => {
  const containerRef = useRestoreFocusRef<HTMLDivElement>(focusTargetId, {
    shouldRestoreFocus,
    onFocusRestored,
  });

  return <div ref={containerRef}>{children}</div>;
};

describe('useRestoreFocusRef', () => {
  it('focuses the first focusable descendant of the target element', async () => {
    const onFocusRestored = vi.fn();

    render(
      <FocusTargetTest
        focusTargetId='target'
        onFocusRestored={onFocusRestored}
      >
        <div id='target'>
          <button>Target action</button>
        </div>
      </FocusTargetTest>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Target action' })).toHaveFocus(),
    );
    expect(onFocusRestored).toHaveBeenCalledTimes(1);
  });

  it('focuses the target element itself when it has no focusable descendants', async () => {
    const onFocusRestored = vi.fn();

    render(
      <FocusTargetTest
        focusTargetId='target'
        onFocusRestored={onFocusRestored}
      >
        <div id='target'>Target content</div>
      </FocusTargetTest>,
    );

    const target = screen.getByText('Target content');
    await waitFor(() => expect(target).toHaveFocus());
    expect(target).not.toHaveAttribute('tabindex');
    expect(onFocusRestored).toHaveBeenCalledTimes(1);
  });

  it('waits for the target element to appear', async () => {
    const onFocusRestored = vi.fn();
    const { rerender } = render(
      <FocusTargetTest
        focusTargetId='target'
        onFocusRestored={onFocusRestored}
      >
        <span>Loading</span>
      </FocusTargetTest>,
    );

    rerender(
      <FocusTargetTest
        focusTargetId='target'
        onFocusRestored={onFocusRestored}
      >
        <button id='target'>Loaded target</button>
      </FocusTargetTest>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Loaded target' })).toHaveFocus(),
    );
    expect(onFocusRestored).toHaveBeenCalledTimes(1);
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
