import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetRightHoldersQuery, useGetReporteeQuery, User } from '@/rtk/features/userInfoApi';
import { mapConnectionToParty } from './partyUtils';

/**
 * useConnectedParty
 * ------------------
 * Hook that fetches the connection between the acting party and either the `from` or `to` party.
 *
 * Returns the connection if it exists.
 */

export const useConnectedParty = ({
  partyUuid,
  fromUuid,
  toUuid,
  skip,
}: {
  partyUuid?: string;
  fromUuid?: string;
  toUuid?: string;
  skip?: boolean;
}) => {
  // const partyUuid = getCookie('AltinnPartyUuid') ?? '';

  const request = {
    partyUuid: partyUuid ?? getCookie('AltinnPartyUuid') ?? '',
    fromUuid: fromUuid ?? partyUuid,
    toUuid: toUuid ?? partyUuid,
  };

  const { data: connection, isLoading } = useGetRightHoldersQuery(request, {
    skip: skip || !partyUuid || (!fromUuid && !toUuid),
  });

  const partyConnection = connection?.[0];

  const party = mapConnectionToParty(partyConnection?.party);
  return { partyConnection, party, isLoading };
};

export default useConnectedParty;
