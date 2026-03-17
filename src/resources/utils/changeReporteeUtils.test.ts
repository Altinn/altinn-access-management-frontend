import { beforeEach, describe, expect, test } from 'vitest';

import {
  getChangeReporteeAndRedirectUrl,
  getDefaultChangeReporteeRedirectTarget,
} from './changeReporteeUtils';

describe('changeReporteeUtils', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/accessmanagement/ui/poa-overview');
  });

  test('builds default redirect target to access management root', () => {
    expect(getDefaultChangeReporteeRedirectTarget()).toBe(
      `${window.location.origin}/accessmanagement/ui`,
    );
  });

  test('builds change reportee url with selected party and goTo target', () => {
    const goTo = `${window.location.origin}/accessmanagement/ui/poa-overview/instance?dialogId=abc`;

    expect(getChangeReporteeAndRedirectUrl('party-123', goTo)).toBe(
      `https://altinn.no/ui/Reportee/ChangeReporteeAndRedirect/?P=party-123&goTo=${encodeURIComponent(goTo)}`,
    );
  });
});
