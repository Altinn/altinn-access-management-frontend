import { RequestResourceDto } from '@/rtk/features/requestApi';

export const getSingleRightRequestId = (
  singleRightRequests: RequestResourceDto[] | undefined,
  resourceId: string,
  toPartyUuid?: string,
): string | undefined => {
  return singleRightRequests?.find(
    (x) => x.resourceId === resourceId && x.to.id === toPartyUuid && x.status === 'Pending',
  )?.id;
};

export const getRequestPartyQueryParams = (
  actingPartyUuid?: string,
  toPartyUuid?: string,
): { party: string; to: string } => {
  return { party: actingPartyUuid || '', to: toPartyUuid || '' };
};
