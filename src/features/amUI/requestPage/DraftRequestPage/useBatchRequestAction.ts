import { useState, useCallback, useRef } from 'react';
import {
  useConfirmRequestMutation,
  useWithdrawRequestMutation,
  type EnrichedRequest,
  isEnrichedPackageRequest,
  requestApi,
} from '@/rtk/features/requestApi';
import { useAppDispatch } from '@/rtk/app/hooks';

export interface FailedRequest {
  request: EnrichedRequest;
  name: string;
}

interface UseBatchRequestActionResult {
  confirmAll: () => Promise<boolean>;
  withdrawAll: () => Promise<boolean>;
  isProcessing: boolean;
  allSucceeded: boolean;
  actionType: 'confirm' | 'withdraw' | null;
  failedRequests: FailedRequest[];
}

export const useBatchRequestAction = (requests: EnrichedRequest[]): UseBatchRequestActionResult => {
  const [confirmRequest] = useConfirmRequestMutation();
  const [withdrawRequest] = useWithdrawRequestMutation();
  const dispatch = useAppDispatch();

  const [isProcessing, setIsProcessing] = useState(false);
  const [allSucceeded, setAllSucceeded] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'withdraw' | null>(null);
  const [failedRequests, setFailedRequests] = useState<FailedRequest[]>([]);

  const lastActionRef = useRef<'confirm' | 'withdraw' | null>(null);

  const performAction = useCallback(
    async (targetRequests: EnrichedRequest[], action: 'confirm' | 'withdraw'): Promise<boolean> => {
      setIsProcessing(true);
      setAllSucceeded(false);
      setActionType(action);
      lastActionRef.current = action;

      const performMutation = action === 'confirm' ? confirmRequest : withdrawRequest;

      const results = await Promise.allSettled(
        targetRequests.map((r) => performMutation({ party: r.from.id, id: r.id }).unwrap()),
      );

      const failed: FailedRequest[] = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const req = targetRequests[index];
          failed.push({
            request: req,
            name: isEnrichedPackageRequest(req) ? req.package.name : req.resource.title,
          });
        }
      });

      let succeeded = false;

      if (failed.length > 0) {
        // Refetch failed requests to check if they are still in Draft status
        const refetchResults = await Promise.allSettled(
          failed.map(async (f) => {
            const queryResult = dispatch(
              requestApi.endpoints.getEnrichedDraftRequest.initiate(
                { id: f.request.id },
                { forceRefetch: true },
              ),
            );

            try {
              return await queryResult.unwrap();
            } finally {
              queryResult.unsubscribe();
            }
          }),
        );

        const stillFailedRequests: FailedRequest[] = [];
        refetchResults.forEach((result, index) => {
          // Keep as failed if: refetch succeeded and the request is still in Draft
          if (result.status === 'fulfilled' && result.value.status === 'Draft') {
            stillFailedRequests.push(failed[index]);
          }
        });

        setFailedRequests(stillFailedRequests);
        succeeded = stillFailedRequests.length === 0;
        setAllSucceeded(succeeded);
      } else {
        setFailedRequests([]);
        succeeded = true;
        setAllSucceeded(true);
      }

      setIsProcessing(false);
      return succeeded;
    },
    [confirmRequest, withdrawRequest, dispatch],
  );

  const confirmAll = useCallback(
    () => performAction(requests, 'confirm'),
    [performAction, requests],
  );

  const withdrawAll = useCallback(
    () => performAction(requests, 'withdraw'),
    [performAction, requests],
  );

  return {
    confirmAll,
    withdrawAll,
    isProcessing,
    allSucceeded,
    actionType,
    failedRequests,
  };
};
