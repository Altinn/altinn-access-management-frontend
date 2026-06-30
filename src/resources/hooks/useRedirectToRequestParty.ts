import { useEffect } from 'react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';

/**
 * Redirects the user to change their active reportee when a request belongs to a
 * different party than the one currently selected, then returns to the current
 * page once the reportee has been switched.
 *
 * @param requestPartyUuid the party the request belongs to (from the loaded request)
 * @returns the currently selected party uuid (from the `AltinnPartyUuid` cookie)
 */
export const useRedirectToRequestParty = (requestPartyUuid: string | undefined): string | null => {
  const partyUuid = getCookie('AltinnPartyUuid');

  useEffect(() => {
    if (requestPartyUuid && requestPartyUuid !== partyUuid) {
      redirectToChangeReporteeAndRedirect(requestPartyUuid, window.location.href);
    }
  }, [requestPartyUuid, partyUuid]);

  return partyUuid;
};
