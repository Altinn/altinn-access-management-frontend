// Focus ids for client package rows (RestoreFocus, WCAG 2.4.3).
//
// The same access package id can appear under multiple agents/clients in the same list, so the row
// focus id includes the owner id to stay unique within the RestoreFocusProvider container. The row
// is itself rendered as a button, so the inline "Gi"/"Slett" action needs a distinct id — otherwise
// the row wins as the first focusable for the row id and focus lands on the row instead of the
// button after an inline delegate/revoke swap.
export const clientPackageRowFocusId = (ownerId: string, packageId: string) =>
  `client-pkg-${ownerId}-${packageId}`;

export const clientPackageActionFocusId = (rowFocusId: string) => `${rowFocusId}-action`;
