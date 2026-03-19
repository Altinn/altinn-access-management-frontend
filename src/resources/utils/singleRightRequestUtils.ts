import { RequestResourceDto } from '@/rtk/features/requestApi';

export const getSingleRightRequestId = (
  singleRightRequests: RequestResourceDto[] | undefined,
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
): { party: string; to: string } => {
  return { party: actingPartyUuid || '', to: fromPartyUuid || '' };
};
