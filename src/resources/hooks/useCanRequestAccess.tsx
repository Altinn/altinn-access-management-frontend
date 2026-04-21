import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';
import { displayPackageRequests } from '@/resources/utils/featureFlagUtils';

/** A hook to determine if the current user can request access to/from the party with the provided uuid */
export const useCanRequestAccess = (id: string, isReportee: boolean = false) => {
  const { selfParty } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();

  if (isReportee) return true;

  const isCurrentUser = selfParty?.partyUuid === id;
  const canGiveAccess = !isCurrentUser || (isCurrentUser && isHovedadmin);

  return !canGiveAccess && displayPackageRequests();
};
