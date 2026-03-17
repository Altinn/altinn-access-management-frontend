import { useEffect, useRef } from 'react';
import { type SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import { getAfUrl } from '@/resources/utils/pathUtils';
import {
  type ReporteeInfo,
  useGetReporteeListForAuthorizedUserQuery,
} from '@/rtk/features/userInfoApi';

export type InstanceDeeplinkGuardStatus =
  | 'ready'
  | 'loading'
  | 'redirecting'
  | 'unauthorized'
  | 'error';

interface GetInstanceDeeplinkGuardStatusArgs {
  actingPartyUuid?: string;
  requestedPartyUuid?: string;
  reporteeList?: ReporteeInfo[];
  isAuthorizedPartyListLoading: boolean;
  isAuthorizedPartyListError: boolean;
}

interface UseInstanceDeeplinkReporteeGuardArgs {
  actingPartyUuid?: string;
  requestedPartyUuid?: string;
}

interface UseInstanceDeeplinkReporteeGuardResult {
  status: InstanceDeeplinkGuardStatus;
  error?: FetchBaseQueryError | SerializedError;
}

export const normalizePartyUuid = (partyUuid?: string | null) =>
  partyUuid?.trim().toLowerCase() ?? '';

export const getRequestedPartyUuid = (searchParams: URLSearchParams) =>
  searchParams.get('partyUuid') ?? searchParams.get('partyuuid') ?? '';

export const getInboxUrlForDialogId = (dialogId?: string | null) =>
  dialogId ? `${getAfUrl()}inbox/${encodeURIComponent(dialogId)}` : `${getAfUrl()}inbox`;

export const getUrlWithoutRequestedPartyUuid = (url: string) => {
  const cleanUrl = new URL(url);
  cleanUrl.searchParams.delete('partyUuid');
  cleanUrl.searchParams.delete('partyuuid');

  return cleanUrl.toString();
};

export const hasAccessToRequestedParty = (
  reporteeList: ReporteeInfo[] | undefined,
  requestedPartyUuid: string,
) => {
  const normalizedRequestedPartyUuid = normalizePartyUuid(requestedPartyUuid);

  if (!normalizedRequestedPartyUuid || !reporteeList?.length) {
    return false;
  }

  const stack = [...reporteeList];

  while (stack.length > 0) {
    const currentReportee = stack.pop();

    if (!currentReportee) {
      continue;
    }

    if (normalizePartyUuid(currentReportee.partyUuid) === normalizedRequestedPartyUuid) {
      return true;
    }

    if (currentReportee.subunits?.length) {
      stack.push(...currentReportee.subunits);
    }
  }

  return false;
};

export const getInstanceDeeplinkGuardStatus = ({
  actingPartyUuid,
  requestedPartyUuid,
  reporteeList,
  isAuthorizedPartyListLoading,
  isAuthorizedPartyListError,
}: GetInstanceDeeplinkGuardStatusArgs): InstanceDeeplinkGuardStatus => {
  const normalizedActingPartyUuid = normalizePartyUuid(actingPartyUuid);
  const normalizedRequestedPartyUuid = normalizePartyUuid(requestedPartyUuid);

  if (!normalizedRequestedPartyUuid || normalizedRequestedPartyUuid === normalizedActingPartyUuid) {
    return 'ready';
  }

  if (isAuthorizedPartyListLoading) {
    return 'loading';
  }

  if (isAuthorizedPartyListError || !reporteeList) {
    return 'error';
  }

  return hasAccessToRequestedParty(reporteeList, normalizedRequestedPartyUuid)
    ? 'redirecting'
    : 'unauthorized';
};

export const useInstanceDeeplinkReporteeGuard = ({
  actingPartyUuid,
  requestedPartyUuid,
}: UseInstanceDeeplinkReporteeGuardArgs): UseInstanceDeeplinkReporteeGuardResult => {
  const hasTriggeredRedirect = useRef(false);

  const shouldValidateRequestedParty =
    !!normalizePartyUuid(requestedPartyUuid) &&
    normalizePartyUuid(requestedPartyUuid) !== normalizePartyUuid(actingPartyUuid);

  const {
    data: reporteeList,
    isLoading: isAuthorizedPartyListLoading,
    isError: isAuthorizedPartyListError,
    error,
  } = useGetReporteeListForAuthorizedUserQuery(undefined, {
    skip: !shouldValidateRequestedParty,
  });

  const status = getInstanceDeeplinkGuardStatus({
    actingPartyUuid,
    requestedPartyUuid,
    reporteeList,
    isAuthorizedPartyListLoading,
    isAuthorizedPartyListError,
  });

  useEffect(() => {
    if (status !== 'redirecting' || hasTriggeredRedirect.current || !requestedPartyUuid) {
      return;
    }

    hasTriggeredRedirect.current = true;
    redirectToChangeReporteeAndRedirect(
      requestedPartyUuid,
      getUrlWithoutRequestedPartyUuid(window.location.href),
    );
  }, [requestedPartyUuid, status]);

  return {
    status,
    error,
  };
};
