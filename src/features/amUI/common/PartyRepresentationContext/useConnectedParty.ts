import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { mapConnectionToParty } from './partyUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';

/**
 * useConnectedParty
 * ------------------
 * Hook that fetches the connection between the acting party and either the fromParty or toParty.
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
  const actingPartyUuid = getCookie('AltinnPartyUuid') ?? '';
  const request = {
    partyUuid: actingPartyUuid ?? '',
    fromUuid: fromPartyUuid ?? actingPartyUuid ?? '',
    toUuid: toPartyUuid ?? actingPartyUuid ?? '',
  };

  const {
    data: connection,
    isLoading,
    isError,
    error,
  } = useGetRightHoldersQuery(request, {
    skip: (!fromPartyUuid && !toPartyUuid) || skip,
  });

  const partyConnection = connection?.[0];

  const party = mapConnectionToParty(partyConnection?.party);
  return { party, isLoading, error, isError };
};

export default useConnectedParty;
