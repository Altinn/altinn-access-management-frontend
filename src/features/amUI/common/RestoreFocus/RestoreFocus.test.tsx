import React, { useEffect, useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RestoreFocusProvider, useRestoreFocus } from './RestoreFocus';
import {
  RestoreFocusFallback,
  RestoreFocusTarget,
  useRestoreFocusTarget,
} from './RestoreFocusTarget';
import {
  focusFirstEnabledButton,
  useRestoreFocusAfterSettled,
} from './useRestoreFocusAfterSettled';

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
      <button>Elsewhere</button>
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

const FallbackTest = ({
  focusTargetId,
  includeItem,
}: {
  focusTargetId: string;
  includeItem: boolean;
}) => {
  const restoreFocus = useRestoreFocus();
  const { requestFocus } = restoreFocus;

  useEffect(() => {
    requestFocus(focusTargetId);
  }, [focusTargetId, requestFocus]);

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <h2>List heading</h2>
      </RestoreFocusFallback>
      {includeItem && (
        <>
          <RestoreFocusTarget id='item' />
          <div id='item'>
            <button>Item action</button>
          </div>
        </>
      )}
    </RestoreFocusProvider>
  );
};

const FallbackWithNestedDialogTest = () => {
  const restoreFocus = useRestoreFocus();
  const { requestFocus } = restoreFocus;

  useEffect(() => {
    requestFocus('deleted-item');
  }, [requestFocus]);

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <dialog>
          <button>Dialog close</button>
        </dialog>
        <button>List action</button>
      </RestoreFocusFallback>
    </RestoreFocusProvider>
  );
};

const FallbackWithPreferredTargetTest = () => {
  const restoreFocus = useRestoreFocus();
  const { requestFocus } = restoreFocus;

  useEffect(() => {
    requestFocus('deleted-item');
  }, [requestFocus]);

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <button>List action</button>
        <section>
          <p data-restore-focus-fallback>No requests</p>
        </section>
      </RestoreFocusFallback>
    </RestoreFocusProvider>
  );
};

const RemovalHookTest = () => {
  const restoreFocus = useRestoreFocus();
  const [items, setItems] = useState(['item']);
  const [isSettling, setIsSettling] = useState(false);
  const restoreFocusAfterDelete = useRestoreFocusAfterSettled<string>({
    isSettling,
    onRestore: restoreFocus.requestFocus,
  });

  return (
    <>
      <button
        onClick={() => {
          setItems([]);
          setIsSettling(false);
        }}
      >
        Finish removal
      </button>
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        <RestoreFocusFallback>
          <h2>List heading</h2>
        </RestoreFocusFallback>
        {items.includes('item') && (
          <>
            <RestoreFocusTarget id='item' />
            <button
              id='item'
              onClick={() => {
                setIsSettling(true);
                restoreFocusAfterDelete('item');
              }}
            >
              Delete item
            </button>
          </>
        )}
      </RestoreFocusProvider>
    </>
  );
};

const FallbackDoesNotStealFocusTest = () => {
  const restoreFocus = useRestoreFocus();

  return (
    <>
      <button onClick={() => restoreFocus.requestFocus('deleted-item')}>Restore deleted</button>
      <button>Elsewhere</button>
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        <RestoreFocusFallback>
          <h2>List heading</h2>
        </RestoreFocusFallback>
      </RestoreFocusProvider>
    </>
  );
};

const ActionSettleFocusTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [actionLabel, setActionLabel] = useState('Initial action');
  const actionsRef = useRef<HTMLDivElement>(null);
  useRestoreFocusAfterSettled({
    isSettling: isLoading || isSettling,
    requestWhen: isLoading,
    onRestore: () => focusFirstEnabledButton(actionsRef.current),
  });

  return (
    <>
      <button onClick={() => setIsLoading(true)}>Start action</button>
      <button
        onClick={() => {
          setActionLabel('Next action');
          setIsLoading(false);
          setIsSettling(false);
        }}
      >
        Finish action
      </button>
      <button>Elsewhere</button>
      <div ref={actionsRef}>
        {isLoading || isSettling ? <span>Loading</span> : <button>{actionLabel}</button>}
      </div>
    </>
  );
};

describe('RestoreFocus', () => {
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

    // Focus is lost again (e.g. the swapped button was disabled and blurred), so a second request
    // restores it.
    target.blur();
    fireEvent.click(restoreButton);
    await waitFor(() => expect(target).toHaveFocus());
  });

  it('does not steal focus when the user has already moved it elsewhere', async () => {
    render(<RepeatRestoreTest />);

    const restoreButton = screen.getByRole('button', { name: 'Restore' });
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    const target = screen.getByRole('button', { name: 'Target action' });

    elsewhere.focus();
    expect(elsewhere).toHaveFocus();

    fireEvent.click(restoreButton);

    // The request resolves but focus is owned by a real element, so it is left alone.
    await waitFor(() => expect(target).toBeInTheDocument());
    expect(elsewhere).toHaveFocus();
    expect(target).not.toHaveFocus();
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

  it('focuses the fallback when no requested id is present in the container', async () => {
    render(
      <FallbackTest
        focusTargetId='deleted-item'
        includeItem={false}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'List heading' })).toHaveFocus(),
    );
  });

  it('focuses the fallback when a removed target is gone after settling', async () => {
    render(<RemovalHookTest />);

    const deleteButton = screen.getByRole('button', { name: 'Delete item' });
    deleteButton.focus();
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByRole('button', { name: 'Finish removal' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'List heading' })).toHaveFocus(),
    );
  });

  it('does not focus the fallback when the user has already moved focus elsewhere', async () => {
    render(<FallbackDoesNotStealFocusTest />);

    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    elsewhere.focus();
    fireEvent.click(screen.getByRole('button', { name: 'Restore deleted' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'List heading' })).toBeInTheDocument(),
    );
    expect(elsewhere).toHaveFocus();
  });

  it('does not use focusable controls from nested dialogs as fallback targets', async () => {
    render(<FallbackWithNestedDialogTest />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'List action' })).toHaveFocus());
    expect(screen.getByText('Dialog close')).not.toHaveFocus();
  });

  it('focuses a preferred fallback target when one is marked', async () => {
    render(<FallbackWithPreferredTargetTest />);

    await waitFor(() => expect(screen.getByText('No requests')).toHaveFocus());
    expect(screen.getByRole('button', { name: 'List action' })).not.toHaveFocus();
  });

  it('does not use the fallback when a requested id is present', async () => {
    render(
      <FallbackTest
        focusTargetId='item'
        includeItem
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Item action' })).toHaveFocus());
    expect(screen.getByRole('heading', { name: 'List heading' })).not.toHaveFocus();
  });

  it('allows restore targets to render without a provider', () => {
    render(<NoProviderTarget />);

    expect(screen.getByRole('button', { name: 'Target action' })).toBeInTheDocument();
  });

  it('focuses the next action button after an action settles', async () => {
    render(<ActionSettleFocusTest />);

    fireEvent.click(screen.getByRole('button', { name: 'Start action' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish action' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Next action' })).toHaveFocus());
  });

  it('does not focus the next action button when focus moved elsewhere while settling', async () => {
    render(<ActionSettleFocusTest />);

    fireEvent.click(screen.getByRole('button', { name: 'Start action' }));
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    elsewhere.focus();
    fireEvent.click(screen.getByRole('button', { name: 'Finish action' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next action' })).toBeInTheDocument(),
    );
    expect(elsewhere).toHaveFocus();
  });
});
