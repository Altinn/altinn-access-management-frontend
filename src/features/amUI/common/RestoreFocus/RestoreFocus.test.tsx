import React, { useEffect, useRef, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RestoreFocusProvider, useRestoreFocus } from './RestoreFocus';
import { RestoreFocusFallback, useRestoreFocusTarget } from './RestoreFocusTarget';
import {
  focusFirstEnabledButton,
  useRestoreFocusAfterSettled,
} from './useRestoreFocusAfterSettled';
import { useRestoreFocusOnDataChange } from './useRestoreFocusOnDataChange';

// Test-only stand-in for the (removed) RestoreFocusTarget JSX component — production code calls
// useRestoreFocusTarget directly, but the tests below render it as a sibling marker for brevity.
const TargetMarker = ({ id }: { id: string }) => {
  useRestoreFocusTarget(id);
  return null;
};

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
            <TargetMarker id='target' />
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
        <TargetMarker id='target' />
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
            <TargetMarker id='target' />
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
          <TargetMarker id='item' />
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
        <dialog open>
          <button>Dialog close</button>
        </dialog>
        <button>List action</button>
      </RestoreFocusFallback>
    </RestoreFocusProvider>
  );
};

const FallbackWithFallbackIdTest = ({
  includeFallbackTarget,
}: {
  includeFallbackTarget: boolean;
}) => {
  const restoreFocus = useRestoreFocus();
  const { requestFocus } = restoreFocus;

  useEffect(() => {
    requestFocus('deleted-item', 'area-content');
  }, [requestFocus]);

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <h2>List heading</h2>
      </RestoreFocusFallback>
      {includeFallbackTarget && (
        <div id='area-content'>
          <button>Area action</button>
        </div>
      )}
    </RestoreFocusProvider>
  );
};

const FallbackWithNonInteractiveFallbackIdTest = () => {
  const restoreFocus = useRestoreFocus();
  const { requestFocus } = restoreFocus;

  useEffect(() => {
    requestFocus('deleted-item', 'section-heading');
  }, [requestFocus]);

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <h2 id='section-heading'>Section heading</h2>
      <RestoreFocusFallback>
        <button>List action</button>
      </RestoreFocusFallback>
    </RestoreFocusProvider>
  );
};

const RemovalHookTest = () => {
  const restoreFocus = useRestoreFocus();
  const [items, setItems] = useState(['item']);
  const [isPending, setIsPending] = useState(false);
  useRestoreFocusAfterSettled({
    isSettled: !isPending,
    requestWhen: isPending,
    onRestore: () => restoreFocus.requestFocus('item'),
  });

  return (
    <>
      <button
        onClick={() => {
          setItems([]);
          setIsPending(false);
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
            <TargetMarker id='item' />
            <button
              id='item'
              onClick={() => setIsPending(true)}
            >
              Delete item
            </button>
          </>
        )}
      </RestoreFocusProvider>
    </>
  );
};

const InstantSettleTest = () => {
  const restoreFocus = useRestoreFocus();
  const [items, setItems] = useState(['item']);
  const [isDeleting, setIsDeleting] = useState(false);
  useRestoreFocusAfterSettled({
    isSettled: true,
    requestWhen: isDeleting,
    onRestore: () => restoreFocus.requestFocus('item'),
  });

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <h2>List heading</h2>
      </RestoreFocusFallback>
      {items.includes('item') && (
        <>
          <TargetMarker id='item' />
          <button
            id='item'
            onClick={() => {
              // A cached/instant mutation: isSettled never observably becomes false.
              setItems([]);
              setIsDeleting(true);
            }}
          >
            Delete item
          </button>
        </>
      )}
    </RestoreFocusProvider>
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
  const [isExtraBusy, setIsExtraBusy] = useState(false);
  const [actionLabel, setActionLabel] = useState('Initial action');
  const actionsRef = useRef<HTMLDivElement>(null);
  useRestoreFocusAfterSettled({
    isSettled: !isLoading && !isExtraBusy,
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
          setIsExtraBusy(false);
        }}
      >
        Finish action
      </button>
      <button>Elsewhere</button>
      <div ref={actionsRef}>
        {isLoading || isExtraBusy ? <span>Loading</span> : <button>{actionLabel}</button>}
      </div>
    </>
  );
};

// A child of the provider owns the watched "data" and calls the hook — mirroring how
// AccessPackageList (a child of its callers' RestoreFocusProvider) uses it in practice.
const SwappingListItem = ({ onReady }: { onReady: (trigger: () => void) => void }) => {
  const [data, setData] = useState({ packageInListA: true });
  const requestFocusOnDataChange = useRestoreFocusOnDataChange(data);

  useEffect(() => {
    onReady(() => {
      requestFocusOnDataChange('moved-item');
      // Simulates the real gap between a mutation resolving and the list query refetching.
      setTimeout(() => setData({ packageInListA: false }), 10);
    });
  }, [onReady, requestFocusOnDataChange]);

  return data.packageInListA ? (
    <button>Old control</button>
  ) : (
    <>
      <TargetMarker id='moved-item' />
      <button id='moved-item'>New control</button>
    </>
  );
};

const DataRefreshSwapTest = () => {
  const restoreFocus = useRestoreFocus();
  const triggerRef = useRef<(() => void) | null>(null);

  return (
    <>
      <button onClick={() => triggerRef.current?.()}>Trigger swap</button>
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        <RestoreFocusFallback>
          <h2>List heading</h2>
        </RestoreFocusFallback>
        <SwappingListItem onReady={(fn) => (triggerRef.current = fn)} />
      </RestoreFocusProvider>
    </>
  );
};

describe('RestoreFocus', () => {
  it('focuses the first focusable descendant of the requested target element', async () => {
    render(
      <FocusTargetTest focusTargetId='target'>
        <TargetMarker id='target' />
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
        <TargetMarker id='target' />
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
          <TargetMarker id='target' />
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
        <TargetMarker id='target' />
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

  it('focuses the fallback id before the generic catch-all when the requested id is gone', async () => {
    render(<FallbackWithFallbackIdTest includeFallbackTarget />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Area action' })).toHaveFocus());
    expect(screen.getByRole('heading', { name: 'List heading' })).not.toHaveFocus();
  });

  it('focuses a non-interactive fallback id element itself when it has no focusable descendant', async () => {
    render(<FallbackWithNonInteractiveFallbackIdTest />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Section heading' })).toHaveFocus(),
    );
    expect(screen.getByRole('button', { name: 'List action' })).not.toHaveFocus();
  });

  it('falls through to the generic fallback when the fallback id is also absent', async () => {
    render(<FallbackWithFallbackIdTest includeFallbackTarget={false} />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'List heading' })).toHaveFocus(),
    );
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

  it('focuses the fallback after a request whose action settles instantly (no observable loading phase)', async () => {
    render(<InstantSettleTest />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'List heading' })).toHaveFocus(),
    );
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

  it('waits for the watched data to refresh before focusing the swapped-in control', async () => {
    render(<DataRefreshSwapTest />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger swap' }));

    // The new control doesn't exist yet, and the watched data hasn't refreshed yet, so neither
    // the target nor the fallback should have fired.
    expect(screen.queryByRole('button', { name: 'New control' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'List heading' })).not.toHaveFocus();

    await waitFor(() => expect(screen.getByRole('button', { name: 'New control' })).toHaveFocus());
    expect(screen.queryByRole('heading', { name: 'List heading' })).not.toHaveFocus();
  });
});
