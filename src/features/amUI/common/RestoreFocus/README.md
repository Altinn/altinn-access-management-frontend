# RestoreFocus

Keeps keyboard and screen-reader focus on something sensible after:

- a modal navigation
- an inline delegate or revoke action
- a deletion that removes the element the user was just on

Without it, focus falls back to `<body>`. A screen-reader user lands at the top of the page with no
idea what happened.

Two rules for a secondary view inside a modal:

1. Opening a secondary view → focus the **back button** that closes it.
2. Closing/going back → focus returns to the **list element** that opened it.

Rule 1 is just autofocusing the back button, see
[useAutoFocusRef](../../../../resources/hooks/useAutoFocusRef.ts). It doesn't use this module.

This module solves the focus-loss problem behind rule 2, and two more cases like it:

- a secondary view closes, and focus should return to the list item that opened it (rule 2)
- an item the user was focused on is deleted from a list
- an action button is temporarily replaced by a loading or success state

Relevant WCAG criteria: 2.4.3 Focus Order (A), 2.4.7 Focus Visible (AA).

## Overview

A **zone** is one list or one modal. It is the area where a focus request gets resolved. Each zone
has one controller (`useRestoreFocus()`) and one `<RestoreFocusProvider>` wrapping it.

Focus needs to move when:

- a sub-view closes
- an item is removed
- an action button disappears

When this happens, the owner calls `requestFocus(id, fallbackId?)`. This does not move focus right
away. It waits until the DOM has caught up.

Every element that could be the target registers itself with `useRestoreFocusTarget(id)`. Whichever
one is currently mounted gets focused.

If no element matches the id, `<RestoreFocusFallback>` catches it instead. This can happen if the id
was deleted, or sits in a collapsed section. Either way, focus never falls back to `<body>`.

Focus is only moved if it was actually lost. If the user has since tabbed somewhere else, nothing happens.

Two helper hooks make sure `requestFocus` fires at the right time:

- `useRestoreFocusOnDataChange` waits for a query cache to refetch.
- `useRestoreFocusAfterSettled` waits for a loading or success animation to finish.

## Case: revoking a package from "Mine tilganger"

`ActiveDelegations` ([userRightsPage/AccessPackageSection/ActiveDelegations.tsx](../../userRightsPage/AccessPackageSection/ActiveDelegations.tsx))
owns the zone. It has one `useRestoreFocus()`, one `<RestoreFocusProvider>` around the list, and
one `<RestoreFocusFallback>` around the list itself.

- Revoking a package unmounts its action button list-wide. A spinner replaces it, so focus drops to
  `<body>`.
- On success, [AccessPackageList.tsx](../AccessPackageList/AccessPackageList.tsx) calls
  `requestFocusOnDataChange(packageActionControlId(id), areaContentId(area.id))`. This waits for the
  `activeDelegations` query cache to refetch.
- Once the package moves to the "available" bucket, the matching delegate button (same id format)
  gets focused directly. The user lands back on the same row, now showing "Gi" instead of "Slett".
- If that section is collapsed, the fallback id (`areaContentId`) catches it instead, and focus
  lands inside the area. If the whole area is collapsed too, the list's own `<RestoreFocusFallback>`
  takes over.

Delegating (the inverse action) follows the same path, but without the fallback id. The "assigned"
bucket has no collapse toggle, so it doesn't need one.

## Case: back button in the delegation modal

`DelegationModalContent` ([DelegationModal/DelegationModalContent.tsx](../DelegationModal/DelegationModalContent.tsx))
owns one zone for the whole modal dialog.

- Selecting a package row opens a secondary detail view. The back button autofocuses via
  `useAutoFocusRef` (rule 1, independent of RestoreFocus).
- Clicking back calls `restoreFocus.requestFocus(packageToView?.id ?? resourceToView?.identifier)`
  before the view flips back.
- The list remounts. The row with that id (registered via `useRestoreFocusTarget`) gets focused. The
  user lands back where they left off, not at the top of the modal.
- A `<RestoreFocusFallback>` around the modal's content area catches the case where that row no
  longer exists, for example if it was just delegated away.

## Case: button swap with no stable id

Some actions replace a button with a loading state, then a success animation, in the same spot.
There is no second element with a matching id to target.

[AccessPackageInfo.tsx](../DelegationModal/AccessPackages/AccessPackageInfo.tsx) handles this with
`useRestoreFocusAfterSettled` and `focusFirstEnabledButton`:

```tsx
const actionsRef = useRef<HTMLDivElement>(null);
useRestoreFocusAfterSettled({
  isSettled: !isActionLoading && !isFetching && !actionSuccess,
  requestWhen: isActionLoading,
  onRestore: () => focusFirstEnabledButton(actionsRef.current),
});
```

Once loading, fetching, and the success animation have all finished, `onRestore` fires once. It
focuses the first enabled button inside `actionsRef`, but only if focus was actually lost.

## API reference

| Export | Use this when you... |
| --- | --- |
| `useRestoreFocus()` | own a zone (a list, a modal, a section) and need a controller. Pass it to `<RestoreFocusProvider>`, and call `requestFocus(id, fallbackId?)` on it. One per zone. |
| `<RestoreFocusProvider restoreFocus>` | wrap the zone's subtree once. This scopes id lookups for `requestFocus` to that subtree. A duplicate id elsewhere on the page (for example, behind a modal) is never matched. |
| `useRestoreFocusContext()` | need to read the controller from a descendant, for example to call `requestFocus` from a button's `onClick`. This avoids creating a second controller. |
| `useRestoreFocusTarget(id)` | render an element that could be the target of a `requestFocus(id)` call. This can be a list row or an inline action button with its own id. Call it once for each id the element should respond to. It is a no-op outside a provider. |
| `<RestoreFocusFallback>` | wrap something durable (a list heading, a modal's content area) to catch focus. This happens when the requested id, and its `fallbackId` if any, are not present. Render exactly one per zone. A `fallbackId` may point at a non-interactive anchor (e.g. a section heading): it gets focused directly if it has no focusable descendant, the same way a `useRestoreFocusTarget` element does. |
| `useRestoreFocusOnDataChange(data)` | need a success callback to request focus on an id that will only exist after a query cache (`data`) refetches. For example, revoke moves an item from one query bucket to another. Call the returned `requestFocusOnDataChange(id, fallbackId?)` right after the action succeeds. It waits for `data` to become a new reference before resolving the focus request. |
| `useRestoreFocusAfterSettled({ isSettled, requestWhen, onRestore })` | have an action that replaces a button with a loading or success state in place, so there is no stable id to target. `onRestore` fires once `isSettled` becomes `true` after `requestWhen` was `true`, whether that took a tick or was instant. |
| `focusFirstEnabledButton(container)` | use this as the `onRestore` for the hook above, when "restore focus" just means focusing whatever button is available again inside this container. |

## Adding this to a new list or modal

1. Pick the zone boundary. This is usually the component that already owns the list/modal's state.
2. Call `const restoreFocus = useRestoreFocus()` there. Wrap the rendered tree in
   `<RestoreFocusProvider restoreFocus={restoreFocus}>`.
3. Wrap something always present (a heading, the content container) in `<RestoreFocusFallback>`.
4. In every row/item component, call `useRestoreFocusTarget(id)` for its own id. Do this again for
   any inline action control that has a distinct id. If the control has no DOM `id`, give it one.
   See `packageActionControlId`/`resourceActionControlId` for the naming pattern.
5. Wire the actual `requestFocus` calls at the point where you know where focus should go next:
   - Closing a sub-view or modal: call `restoreFocus.requestFocus(originatingId)`.
   - An item was removed: call `restoreFocus.requestFocus(removedId, someFallbackId)` once it's
     confirmed gone, so the fallback chain catches it.
   - An action moves an item between query-derived lists: use `useRestoreFocusOnDataChange(data)`
     and call `requestFocusOnDataChange` in the success callback, not `restoreFocus.requestFocus`
     directly.
   - An action swaps a button in place with no new id to target: use `useRestoreFocusAfterSettled`
     with `focusFirstEnabledButton`, or a custom `onRestore`.

## Gotchas

- Setting `disabled` (or some `loading` props) on the currently-focused button blurs it. If a
  button needs to show a loading state without losing focus, keep rendering something focusable
  with the same id. Do not disable or unmount it.
- IDs only need to be unique within one provider's subtree. Don't rely on that elsewhere: reusing an
  id across rows will make the target lookup match the wrong element.
- A fallback target is never a closed `<dialog>`, anything `hidden`/`inert`/`aria-hidden`, or an
  element inside a different dialog than the current scope. See `isUnavailableForFocus` in
  [RestoreFocusTarget.tsx](./RestoreFocusTarget.tsx).
- Don't call `useRestoreFocus()` more than once per zone. Anything below the provider that needs
  access should use `useRestoreFocusContext()` instead.

## Tests

[RestoreFocus.test.tsx](./RestoreFocus.test.tsx) is the executable spec for every scenario above,
including:

- the collapsed-section fallback chain
- the "user already moved focus, don't steal it" guard
- the settle-gating races

Read it before changing the resolution order.
