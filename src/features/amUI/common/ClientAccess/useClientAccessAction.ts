import { useCallback } from 'react';

import type { UseClientAccessDelegationParams } from '../ClientBulkDelegation/useClientAccessDelegation';
import { useClientSingleAccessAction } from '../ClientBulkDelegation/useClientSingleAccessAction';

import { getAccessName, type RunClientAccessAction } from './clientAccessEntry';

/** Delegates or removes one entry through the client delegation endpoints. */
export const useClientAccessAction = (
  params: UseClientAccessDelegationParams,
): RunClientAccessAction => {
  const runSingle = useClientSingleAccessAction(params);

  return useCallback(
    (mode, entry) =>
      runSingle(
        mode,
        { clientId: entry.clientId, agentId: entry.recipient.id },
        { kind: entry.kind, roleCode: entry.roleCode, id: entry.accessId },
        { agentName: entry.recipient.name, accessName: getAccessName(entry) },
      ),
    [runSingle],
  );
};
