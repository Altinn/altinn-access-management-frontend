import { useGetSentRequestsQuery } from '@/rtk/features/requestApi';

import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

export const ORG_INSTANCE_ADMIN_PACKAGE_URN =
  'urn:altinn:accesspackage:tilgangsstyring-enkeltinstanser';

export const useInstanceAdminPackageRequest = () => {
  const { actingParty, selfParty } = usePartyRepresentation();
  const { data: packageRequests, isLoading } = useGetSentRequestsQuery(
    {
      party: selfParty?.id ?? '',
      to: actingParty?.id ?? '',
      status: ['Pending'],
      type: 'package',
    },
    { skip: !selfParty?.id || !actingParty?.id },
  );
  const pendingRequest = packageRequests?.find(
    (r) => r.packageId === ORG_INSTANCE_ADMIN_PACKAGE_URN && r.to.id === actingParty?.id,
  );
  return { actingParty, selfParty, pendingRequest, hasPendingRequest: !!pendingRequest, isLoading };
};
