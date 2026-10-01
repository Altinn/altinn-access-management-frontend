import { useMemo, useState } from 'react';

import { isPersonInputValid, type PersonInput } from '../personIdentifierUtils';
import { useOrgLookup, type OrgLookup } from '../RecipientFields/useOrgLookup';

import type { Recipient, RecipientKind } from './recipient';

export interface RecipientForm {
  kind: RecipientKind;
  setKind: (kind: RecipientKind) => void;
  person: PersonInput;
  setPerson: (person: PersonInput) => void;
  orgLookup: OrgLookup;
  /**
   * The recipient the active tab currently describes, or null while it is incomplete.
   * This one value replaces the four separate validity expressions the flows used to carry.
   */
  recipient: Recipient | null;
}

export const useRecipientForm = ({
  initialKind,
  ownOrgNumber,
}: {
  /*** The tab the form starts on */
  initialKind: RecipientKind;
  /*** The organisation that may not be added to itself, when the flow has one */
  ownOrgNumber?: string;
}): RecipientForm => {
  const [kind, setKind] = useState<RecipientKind>(initialKind);
  const [person, setPerson] = useState<PersonInput>({ personIdentifier: '', lastName: '' });
  const orgLookup = useOrgLookup(ownOrgNumber);

  const recipient = useMemo<Recipient | null>(() => {
    if (kind === 'person') {
      return isPersonInputValid(person)
        ? {
            kind: 'person',
            personIdentifier: person.personIdentifier.trim(),
            lastName: person.lastName.trim(),
          }
        : null;
    }
    return orgLookup.isValid && orgLookup.orgData
      ? { kind: 'org', organization: orgLookup.orgData }
      : null;
  }, [kind, person, orgLookup.isValid, orgLookup.orgData]);

  return { kind, setKind, person, setPerson, orgLookup, recipient };
};
