import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';

/** A hook to determine if the current user could potentially give access to/from the party with the provided uuid */
export const useCanGiveAccess = (id: string, isReportee: boolean = false) => {
  const { selfParty } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  if (isReportee) {
    return false;
  }
  const isCurrentUser = selfParty?.partyUuid === id;
  const canGiveAccess = !isCurrentUser || (isCurrentUser && isHovedadmin);

  return canGiveAccess;
};
