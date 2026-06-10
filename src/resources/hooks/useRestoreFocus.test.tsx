import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRestoreFocus } from './useRestoreFocus';

interface FocusTargetTestProps {
  children: React.ReactNode;
  focusTargetId?: string | null;
  focusNonInteractiveTarget?: boolean;
  shouldRestoreFocus?: boolean;
}

const FocusTargetTest = ({
  children,
  focusTargetId,
  focusNonInteractiveTarget = false,
  shouldRestoreFocus = true,
}: FocusTargetTestProps) => {
  const { containerRef, setFocusTargetId } = useRestoreFocus({
    focusNonInteractiveTarget,
    shouldRestoreFocus,
  });

  useEffect(() => {
    setFocusTargetId(focusTargetId ?? null);
  }, [focusTargetId, setFocusTargetId]);

  return <div ref={containerRef}>{children}</div>;
};

describe('useRestoreFocus', () => {
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

  it('focuses the target inside the container when the same id exists earlier in the document', async () => {
    render(
      <>
        <div id='target'>
          <button>Outside action</button>
        </div>
        <FocusTargetTest focusTargetId='target'>
          <div id='target'>
            <button>Inside action</button>
          </div>
        </FocusTargetTest>
      </>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Inside action' })).toHaveFocus(),
    );
  });

  it('does not focus a target without focusable descendants by default', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <div id='target'>Target content</div>
      </FocusTargetTest>,
    );

    await waitFor(() => expect(screen.getByText('Target content')).not.toHaveFocus());
  });

  it('focuses the target element itself when non-interactive focus is enabled', async () => {
    render(
      <FocusTargetTest
        focusTargetId='target'
        focusNonInteractiveTarget
      >
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
