import { useEffect } from 'react';
import { type SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import {
  type ReporteeInfo,
  useGetReporteeListForAuthorizedUserQuery,
} from '@/rtk/features/userInfoApi';

export type ReporteeGuardStatus = 'ready' | 'loading' | 'redirecting' | 'unauthorized' | 'error';

interface GetReporteeGuardStatusArgs {
  actingPartyUuid?: string;
  requestedPartyUuid?: string;
  reporteeList?: ReporteeInfo[];
  isAuthorizedPartyListLoading: boolean;
  isAuthorizedPartyListError: boolean;
}

interface UseReporteeGuardArgs {
  actingPartyUuid?: string;
  requestedPartyUuid?: string;
}

interface UseReporteeGuardResult {
  status: ReporteeGuardStatus;
  error?: FetchBaseQueryError | SerializedError;
}

export const normalizePartyUuid = (partyUuid?: string | null) =>
  partyUuid?.trim().toLowerCase() ?? '';

export const getUrlWithoutRequestedPartyUuid = (url: string) => {
  try {
    const cleanUrl = new URL(url);
    cleanUrl.searchParams.delete('partyUuid');
    cleanUrl.searchParams.delete('partyuuid');

    return cleanUrl.toString();
  } catch {
    return url;
  }
};

export const hasAccessToRequestedParty = (
  reporteeList: ReporteeInfo[] | undefined,
  requestedPartyUuid: string,
): boolean => {
  const normalized = normalizePartyUuid(requestedPartyUuid);

  if (!normalized || !reporteeList?.length) {
    return false;
  }

  return reporteeList.some(
    (reportee) =>
      normalizePartyUuid(reportee.partyUuid) === normalized ||
      hasAccessToRequestedParty(reportee.subunits, requestedPartyUuid),
  );
};

export const getReporteeGuardStatus = ({
  actingPartyUuid,
  requestedPartyUuid,
  reporteeList,
  isAuthorizedPartyListLoading,
  isAuthorizedPartyListError,
}: GetReporteeGuardStatusArgs): ReporteeGuardStatus => {
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

export const useReporteeGuard = ({
  actingPartyUuid,
  requestedPartyUuid,
}: UseReporteeGuardArgs): UseReporteeGuardResult => {
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

  const status = getReporteeGuardStatus({
    actingPartyUuid,
    requestedPartyUuid,
    reporteeList,
    isAuthorizedPartyListLoading,
    isAuthorizedPartyListError,
  });

  useEffect(() => {
    if (status !== 'redirecting' || !requestedPartyUuid) {
      return;
    }

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
