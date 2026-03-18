import { SingleRightRequest } from '@/rtk/features/requestApi';

export const getSingleRightRequestId = (
  singleRightRequests: SingleRightRequest[] | undefined,
  resourceId: string,
  fromPartyUuid?: string,
): string | undefined => {
  return singleRightRequests?.find(
    (x) => x.resourceId === resourceId && x.from.id === fromPartyUuid && x.status === 'Pending',
  )?.id;
};

export const getRequestPartyQueryParams = (
  actingPartyUuid?: string,
  fromPartyUuid?: string,
): { actingParty: string; to: string } => {
  return { actingParty: actingPartyUuid || '', to: fromPartyUuid || '' };
};
