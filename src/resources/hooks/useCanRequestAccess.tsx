import { usePartyRepresentation } from '@/features/amUI/common/PartyRepresentationContext/PartyRepresentationContext';
import { displayPackageRequests } from '@/resources/utils/featureFlagUtils';

/** Returns true when the user can request access: always when isReportee, otherwise only when acting as themselves viewing another party's resources */
export const useCanRequestAccess = (isReportee: boolean = false) => {
  const { actingParty, toParty, fromParty } = usePartyRepresentation();

  if (!displayPackageRequests()) {
    return false;
  }

  if (isReportee) {
    return true;
  }

  const partyCheck =
    actingParty?.partyUuid === toParty?.partyUuid && toParty?.partyUuid !== fromParty?.partyUuid;

  return partyCheck;
};
