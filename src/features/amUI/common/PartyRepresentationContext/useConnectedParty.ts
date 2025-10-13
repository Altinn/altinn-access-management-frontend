import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { mapConnectionToParty } from './partyUtils';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

/**
 * useConnectedParty
 * ------------------
 * Hook that fetches the connection between the current user and either the fromParty or toParty.
 *
 * Returns the connection if it exists.
 */

export const useConnectedParty = ({
  fromPartyUuid,
  toPartyUuid,
  skip = false,
}: {
  fromPartyUuid?: string;
  toPartyUuid?: string;
  skip?: boolean;
}) => {
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const actingPartyUuid = getCookie('AltinnPartyUuid') ?? '';
  const request = {
    partyUuid: actingPartyUuid ?? '',
    fromUuid: fromPartyUuid ?? actingPartyUuid ?? '',
    toUuid: toPartyUuid ?? actingPartyUuid ?? '',
  };

  const { data: connection, isLoading } = useGetRightHoldersQuery(request, {
    skip: !currentUser?.partyUuid || (!fromPartyUuid && !toPartyUuid) || skip,
  });

  const partyConnection = connection?.[0];

  const party = mapConnectionToParty(partyConnection?.party);
  return { party, isLoading: isLoading || currentUserIsLoading };
};

export default useConnectedParty;
