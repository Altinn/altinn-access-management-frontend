import React, { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  RestoreFocusProvider,
  RestoreFocusTarget,
  useRestoreFocus,
  useRestoreFocusTarget,
} from './RestoreFocusContext';

interface FocusTargetTestProps {
  children: React.ReactNode;
  focusTargetId?: string | null;
  focusNonInteractiveTarget?: boolean;
}

const FocusTargetTest = ({
  children,
  focusTargetId,
  focusNonInteractiveTarget = false,
}: FocusTargetTestProps) => {
  const { containerRef, requestFocus, contextValue } = useRestoreFocus({
    focusNonInteractiveTarget,
  });

  useEffect(() => {
    if (focusTargetId) {
      requestFocus(focusTargetId);
    }
  }, [focusTargetId, requestFocus]);

  return (
    <RestoreFocusProvider value={contextValue}>
      <div ref={containerRef}>{children}</div>
    </RestoreFocusProvider>
  );
};

const DelayedMountTest = () => {
  const [isTargetMounted, setIsTargetMounted] = useState(false);
  const { containerRef, requestFocus, contextValue } = useRestoreFocus();

  return (
    <RestoreFocusProvider value={contextValue}>
      <button onClick={() => requestFocus('target')}>Request focus</button>
      <button onClick={() => setIsTargetMounted(true)}>Mount target</button>
      <div ref={containerRef}>
        {isTargetMounted && (
          <>
            <RestoreFocusTarget id='target' />
            <button id='target'>Target action</button>
          </>
        )}
      </div>
    </RestoreFocusProvider>
  );
};

const RepeatRestoreTest = () => {
  const { containerRef, requestFocus, contextValue } = useRestoreFocus();

  return (
    <RestoreFocusProvider value={contextValue}>
      <button onClick={() => requestFocus('target')}>Restore</button>
      <div ref={containerRef}>
        <RestoreFocusTarget id='target' />
        <button id='target'>Target action</button>
      </div>
    </RestoreFocusProvider>
  );
};

const ConsumedRequestTest = () => {
  const [isTargetMounted, setIsTargetMounted] = useState(true);
  const { containerRef, requestFocus, contextValue } = useRestoreFocus();

  return (
    <RestoreFocusProvider value={contextValue}>
      <button onClick={() => requestFocus('target')}>Restore</button>
      <button onClick={() => setIsTargetMounted(false)}>Unmount target</button>
      <button onClick={() => setIsTargetMounted(true)}>Remount target</button>
      <button>Other action</button>
      <div ref={containerRef}>
        {isTargetMounted && (
          <>
            <RestoreFocusTarget id='target' />
            <button id='target'>Target action</button>
          </>
        )}
      </div>
    </RestoreFocusProvider>
  );
};

const NoProviderTarget = () => {
  useRestoreFocusTarget('target');
  return <button id='target'>Target action</button>;
};

describe('RestoreFocusContext', () => {
  it('focuses the first focusable descendant of the requested target element', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <RestoreFocusTarget id='target' />
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
          <RestoreFocusTarget id='target' />
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
        <RestoreFocusTarget id='target' />
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
        <RestoreFocusTarget id='target' />
        <div id='target'>Target content</div>
      </FocusTargetTest>,
    );

    const target = screen.getByText('Target content');
    await waitFor(() => expect(target).toHaveFocus());
    expect(target).not.toHaveAttribute('tabindex');
  });

  it('focuses the target when it mounts after the request', async () => {
    render(<DelayedMountTest />);

    fireEvent.click(screen.getByRole('button', { name: 'Request focus' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mount target' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Target action' })).toHaveFocus(),
    );
  });

  it('restores focus again when the same id is requested twice', async () => {
    render(<RepeatRestoreTest />);

    const restoreButton = screen.getByRole('button', { name: 'Restore' });
    const target = screen.getByRole('button', { name: 'Target action' });

    fireEvent.click(restoreButton);
    await waitFor(() => expect(target).toHaveFocus());

    restoreButton.focus();
    fireEvent.click(restoreButton);
    await waitFor(() => expect(target).toHaveFocus());
  });

  it('does not refocus a consumed request when the target remounts later', async () => {
    render(<ConsumedRequestTest />);

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Target action' })).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Unmount target' }));
    const otherAction = screen.getByRole('button', { name: 'Other action' });
    otherAction.focus();
    fireEvent.click(screen.getByRole('button', { name: 'Remount target' }));

    expect(screen.getByRole('button', { name: 'Target action' })).toBeInTheDocument();
    expect(otherAction).toHaveFocus();
  });

  it('allows restore targets to render without a provider', () => {
    render(<NoProviderTarget />);

    expect(screen.getByRole('button', { name: 'Target action' })).toBeInTheDocument();
  });
});
