import { SingleRightRequest } from '@/rtk/features/requestApi';

export const getSingleRightRequestId = (
  singleRightRequests: SingleRightRequest[] | undefined,
  resourceId: string,
  toPartyUuid?: string,
): string | undefined => {
  return singleRightRequests?.find(
    (x) => x.resourceId === resourceId && x.to.id === toPartyUuid && x.status === 'Pending',
  )?.id;
};
