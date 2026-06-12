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
  focusTargetId?: string;
}

const FocusTargetTest = ({ children, focusTargetId }: FocusTargetTestProps) => {
  const restoreFocus = useRestoreFocus();
  const { requestFocus } = restoreFocus;

  useEffect(() => {
    if (focusTargetId) {
      requestFocus(focusTargetId);
    }
  }, [focusTargetId, requestFocus]);

  return <RestoreFocusProvider restoreFocus={restoreFocus}>{children}</RestoreFocusProvider>;
};

const DelayedMountTest = () => {
  const [isTargetMounted, setIsTargetMounted] = useState(false);
  const restoreFocus = useRestoreFocus();

  return (
    <>
      <button onClick={() => restoreFocus.requestFocus('target')}>Request focus</button>
      <button onClick={() => setIsTargetMounted(true)}>Mount target</button>
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        {isTargetMounted && (
          <>
            <RestoreFocusTarget id='target' />
            <button id='target'>Target action</button>
          </>
        )}
      </RestoreFocusProvider>
    </>
  );
};

const RepeatRestoreTest = () => {
  const restoreFocus = useRestoreFocus();

  return (
    <>
      <button onClick={() => restoreFocus.requestFocus('target')}>Restore</button>
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        <RestoreFocusTarget id='target' />
        <button id='target'>Target action</button>
      </RestoreFocusProvider>
    </>
  );
};

const ConsumedRequestTest = () => {
  const [isTargetMounted, setIsTargetMounted] = useState(true);
  const restoreFocus = useRestoreFocus();

  return (
    <>
      <button onClick={() => restoreFocus.requestFocus('target')}>Restore</button>
      <button onClick={() => setIsTargetMounted(false)}>Unmount target</button>
      <button onClick={() => setIsTargetMounted(true)}>Remount target</button>
      <button>Other action</button>
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        {isTargetMounted && (
          <>
            <RestoreFocusTarget id='target' />
            <button id='target'>Target action</button>
          </>
        )}
      </RestoreFocusProvider>
    </>
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

  it('focuses a link descendant of the requested target element', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <RestoreFocusTarget id='target' />
        <div id='target'>
          <a href='/details'>Target link</a>
        </div>
      </FocusTargetTest>,
    );

    await waitFor(() => expect(screen.getByRole('link', { name: 'Target link' })).toHaveFocus());
  });

  it('focuses the target inside the provider when the same id exists earlier in the document', async () => {
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

  it('focuses the target element itself when it has no focusable descendants', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <RestoreFocusTarget id='target' />
        <div id='target'>Processed row</div>
        <button>Next action</button>
      </FocusTargetTest>,
    );

    const target = screen.getByText('Processed row');
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
