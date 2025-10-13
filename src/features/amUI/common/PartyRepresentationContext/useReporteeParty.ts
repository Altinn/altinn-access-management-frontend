import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { mapConnectionToParty } from './partyUtils';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';

/**
 * useReporteeParty
 * ------------------
 * Hook that fetches the connection between the current user and the reportee.
 *
 * Returns the party if connection exists.
 */

export const useReporteeParty = () => {
  const partyUuid = getCookie('AltinnPartyUuid') ?? '';
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const { data: connection, isLoading } = useGetRightHoldersQuery(
    {
      partyUuid: currentUser?.partyUuid ?? '',
      fromUuid: partyUuid,
      toUuid: currentUser?.partyUuid,
    },
    {
      skip: !currentUser?.partyUuid || !partyUuid,
    },
  );

  const partyConnection = connection?.[0];

  const party = mapConnectionToParty(partyConnection?.party);
  return { party, isLoading: isLoading || currentUserIsLoading };
};

export default useReporteeParty;
