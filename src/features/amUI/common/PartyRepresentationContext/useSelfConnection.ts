import { getCookie } from '@/resources/Cookie/CookieMethods';
import { Connection, useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useGetPartyFromLoggedInUserQuery } from '@/rtk/features/lookupApi';
import { ExtendedUser } from '@/rtk/features/userInfoApi';

/**
 * useSelfConnection
 * ------------------
 * Hook that fetches the connection between the current user and the
 * reportee with the correct party, roles and connections.
 *
 * Returns the connection with the correct party and roles.
 */

export const useSelfConnection = (): {
  partyConnection: Connection | undefined;
  isLoading: boolean;
} => {
  const partyUuid = getCookie('AltinnPartyUuid') ?? '';
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();

  const { data: connection, isLoading } = useGetRightHoldersQuery(
    {
      partyUuid: currentUser?.partyUuid ?? '',
      fromUuid: partyUuid,
      toUuid: currentUser?.partyUuid ?? '',
    },
    {
      skip: !currentUser?.partyUuid || !partyUuid,
    },
  );

  const existingConn = connection?.find((c) => c.party.id === partyUuid);

  const party: ExtendedUser | undefined = currentUser
    ? {
        id: currentUser.partyUuid,
        name: currentUser.name,
        type: currentUser.partyTypeName?.toString(),
        organizationIdentifier: currentUser.orgNumber,
        partyId: currentUser.partyId,
        dateOfBirth: currentUser.dateOfBirth,
        roles: existingConn?.roles ?? [],
        children: [],
      }
    : undefined;
  const partyConnection: Connection | undefined = party
    ? {
        party,
        roles: existingConn?.roles ?? [],
        connections: existingConn?.connections ?? [],
      }
    : undefined;

  return { partyConnection, isLoading: isLoading || currentUserIsLoading };
};
