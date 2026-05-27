import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetSentRequestsQuery } from '@/rtk/features/requestApi';

export const ORG_INSTANCE_ADMIN_PACKAGE_URN =
  'urn:altinn:accesspackage:tilgangsstyring-enkeltinstanser';

export const useInstanceAdminPackageRequest = () => {
  const { actingParty, selfParty } = usePartyRepresentation();
  const { data: packageRequests, isLoading } = useGetSentRequestsQuery(
    {
      party: selfParty?.partyUuid ?? '',
      to: actingParty?.partyUuid ?? '',
      status: ['Pending'],
      type: 'package',
    },
    { skip: !selfParty?.partyUuid || !actingParty?.partyUuid },
  );
  const pendingRequest = packageRequests?.find(
    (r) => r.packageId === ORG_INSTANCE_ADMIN_PACKAGE_URN && r.to.id === actingParty?.partyUuid,
  );
  return { actingParty, selfParty, pendingRequest, hasPendingRequest: !!pendingRequest, isLoading };
};
