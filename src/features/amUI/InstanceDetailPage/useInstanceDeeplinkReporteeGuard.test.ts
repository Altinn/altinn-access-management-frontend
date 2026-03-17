import { describe, expect, test } from 'vitest';

import type { ReporteeInfo } from '@/rtk/features/userInfoApi';

import {
  getInboxUrlForDialogId,
  getInstanceDeeplinkGuardStatus,
  getRequestedPartyUuid,
  getUrlWithoutRequestedPartyUuid,
  hasAccessToRequestedParty,
} from './useInstanceDeeplinkReporteeGuard';

const reporteeList: ReporteeInfo[] = [
  {
    partyUuid: 'parent-party',
    name: 'Parent Party',
    partyId: '1',
    type: 'Organization',
    isDeleted: false,
    onlyHierarchyElementWithNoAccess: false,
    authorizedResources: [],
    authorizedRoles: [],
    subunits: [
      {
        partyUuid: 'child-party',
        name: 'Child Party',
        partyId: '2',
        type: 'Organization',
        isDeleted: false,
        onlyHierarchyElementWithNoAccess: false,
        authorizedResources: [],
        authorizedRoles: [],
        subunits: [],
      },
    ],
  },
];

describe('useInstanceDeeplinkReporteeGuard', () => {
  test('finds access in nested subunits', () => {
    expect(hasAccessToRequestedParty(reporteeList, 'child-party')).toBe(true);
  });

  test('returns false when requested party is missing', () => {
    expect(hasAccessToRequestedParty(reporteeList, 'missing-party')).toBe(false);
  });

  test('returns ready when requested party is missing from query params', () => {
    expect(
      getInstanceDeeplinkGuardStatus({
        actingPartyUuid: 'current-party',
        requestedPartyUuid: '',
        reporteeList,
        isAuthorizedPartyListLoading: false,
        isAuthorizedPartyListError: false,
      }),
    ).toBe('ready');
  });

  test('returns ready when requested party matches acting party', () => {
    expect(
      getInstanceDeeplinkGuardStatus({
        actingPartyUuid: 'current-party',
        requestedPartyUuid: 'CURRENT-PARTY',
        reporteeList,
        isAuthorizedPartyListLoading: false,
        isAuthorizedPartyListError: false,
      }),
    ).toBe('ready');
  });

  test('returns loading while authorized party list is loading', () => {
    expect(
      getInstanceDeeplinkGuardStatus({
        actingPartyUuid: 'current-party',
        requestedPartyUuid: 'parent-party',
        reporteeList: undefined,
        isAuthorizedPartyListLoading: true,
        isAuthorizedPartyListError: false,
      }),
    ).toBe('loading');
  });

  test('returns error when authorized party lookup fails', () => {
    expect(
      getInstanceDeeplinkGuardStatus({
        actingPartyUuid: 'current-party',
        requestedPartyUuid: 'parent-party',
        reporteeList: undefined,
        isAuthorizedPartyListLoading: false,
        isAuthorizedPartyListError: true,
      }),
    ).toBe('error');
  });

  test('returns redirecting when requested party is authorized', () => {
    expect(
      getInstanceDeeplinkGuardStatus({
        actingPartyUuid: 'current-party',
        requestedPartyUuid: 'child-party',
        reporteeList,
        isAuthorizedPartyListLoading: false,
        isAuthorizedPartyListError: false,
      }),
    ).toBe('redirecting');
  });

  test('returns unauthorized when requested party is not available for the user', () => {
    expect(
      getInstanceDeeplinkGuardStatus({
        actingPartyUuid: 'current-party',
        requestedPartyUuid: 'missing-party',
        reporteeList,
        isAuthorizedPartyListLoading: false,
        isAuthorizedPartyListError: false,
      }),
    ).toBe('unauthorized');
  });

  test('reads partyUuid from deeplink params', () => {
    expect(getRequestedPartyUuid(new URLSearchParams('partyUuid=party-123'))).toBe('party-123');
    expect(getRequestedPartyUuid(new URLSearchParams('partyuuid=party-456'))).toBe('party-456');
  });

  test('falls back to inbox root when dialog id is missing', () => {
    expect(getInboxUrlForDialogId()).toBe('https://af.altinn.no/inbox');
    expect(getInboxUrlForDialogId('dialog-123')).toBe('https://af.altinn.no/inbox/dialog-123');
  });

  test('removes partyUuid from deeplink url', () => {
    expect(
      getUrlWithoutRequestedPartyUuid(
        'https://am.ui.altinn.no/accessmanagement/ui/poa-overview/instance?partyUuid=party-123&dialogId=dialog-123',
      ),
    ).toBe('https://am.ui.altinn.no/accessmanagement/ui/poa-overview/instance?dialogId=dialog-123');
  });
});
