import type { ReactNode } from 'react';

import type { Organization } from '@/rtk/features/lookupApi';

export type RecipientKind = 'person' | 'org';

/**
 * A recipient the dialog can add, and what its submit button says while that tab is active.
 *
 * The own-organisation rule lives on the org member, so it cannot be set on a dialog that never
 * offers an organisation.
 */
export type RecipientOption =
  | {
      type: 'person';
      /*** Already translated */
      submitLabel: string;
    }
  | {
      type: 'org';
      /*** Already translated */
      submitLabel: string;
      /*** The organisation that may not be added to itself */
      ownOrgNumber?: string;
      /*** Shown in place of any error when the org number typed is the one above */
      ownOrgWarning?: ReactNode;
    };

export type OrgRecipientOption = Extract<RecipientOption, { type: 'org' }>;

/*** Someone who can be given access, once the form holds enough to identify them */
export type Recipient =
  | { kind: 'person'; personIdentifier: string; lastName: string }
  | { kind: 'org'; organization: Organization };

/**
 * connectionApi's addRightHolder takes either a person to look up or the uuid of a party that
 * already exists, which is exactly the split between the two recipient kinds.
 */
export const toAddRightHolderArgs = (
  recipient: Recipient,
): { personInput?: { personIdentifier: string; lastName: string }; partyUuidToBeAdded?: string } =>
  recipient.kind === 'person'
    ? {
        personInput: {
          personIdentifier: recipient.personIdentifier,
          lastName: recipient.lastName,
        },
      }
    : { partyUuidToBeAdded: recipient.organization.partyUuid };
