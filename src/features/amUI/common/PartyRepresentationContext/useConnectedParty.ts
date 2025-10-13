import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { mapConnectionToParty } from './partyUtils';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';

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
}: {
  fromPartyUuid?: string;
  toPartyUuid?: string;
}) => {
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const request = {
    partyUuid: currentUser?.partyUuid ?? '',
    fromUuid: fromPartyUuid ?? currentUser?.partyUuid ?? '',
    toUuid: toPartyUuid ?? currentUser?.partyUuid ?? '',
  };

  const { data: connection, isLoading } = useGetRightHoldersQuery(request, {
    skip: !currentUser?.partyUuid || (!fromPartyUuid && !toPartyUuid),
  });

  const partyConnection = connection?.[0];

  const party = mapConnectionToParty(partyConnection?.party);
  return { party, isLoading: isLoading || currentUserIsLoading };
};

export default useConnectedParty;
