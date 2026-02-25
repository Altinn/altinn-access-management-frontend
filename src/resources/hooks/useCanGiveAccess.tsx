import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';

/** A hook to determine if the current user could potentially give access to/from the party with the provided uuid */
export const useCanGiveAccess = (id: string) => {
  const { selfParty } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  const isCurrentUser = selfParty?.partyUuid === id;
  const canGiveAccess = !isCurrentUser || (isCurrentUser && isHovedadmin);

  return canGiveAccess;
};
