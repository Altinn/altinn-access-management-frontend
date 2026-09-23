import { useState } from 'react';

import { useGetOrganizationQuery, type Organization } from '@/rtk/features/lookupApi';

export interface OrgLookup {
  orgNumber: string;
  /*** Spaces are stripped, so a number typed in groups still matches the 9 digit lookup */
  setOrgNumber: (value: string) => void;
  orgData?: Organization;
  isFetching: boolean;
  isError: boolean;
  error: ReturnType<typeof useGetOrganizationQuery>['error'];
  /*** The acting party cannot be added to itself, when the flow says who that is */
  isOwnOrg: boolean;
  /*** Whether the organisation found can be submitted */
  isValid: boolean;
}

/**
 * Looks up the organisation behind an org number as it is typed.
 *
 * The caller owns the lookup rather than the field component, because it is the resolved
 * organisation the caller submits - the field only needs to render it.
 */
export const useOrgLookup = (ownOrgNumber?: string): OrgLookup => {
  const [orgNumber, setOrgNumber] = useState('');

  const {
    data: orgData,
    isFetching,
    error,
    isError,
  } = useGetOrganizationQuery(orgNumber, { skip: orgNumber.length !== 9 });

  const isOwnOrg = !!ownOrgNumber && orgNumber.length === 9 && orgNumber === ownOrgNumber;

  return {
    orgNumber,
    setOrgNumber: (value: string) => setOrgNumber(value.replace(/ /g, '')),
    orgData,
    isFetching,
    isError,
    error,
    isOwnOrg,
    // isFetching is the one to gate on: it stays true while a second lookup replaces a first,
    // where isLoading would already be false and the previous organisation still shown.
    isValid: !!orgData?.partyUuid && orgData.orgNumber === orgNumber && !isOwnOrg && !isFetching,
  };
};
