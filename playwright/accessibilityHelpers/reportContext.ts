import type { TestInfo } from '@playwright/test';

import { formatReportContext } from './accessibilityReport';

type TestParty = { pid?: string; orgNo?: string; name?: string };

export type ReportContext = {
  from?: TestParty;
  to?: TestParty;
  validTo?: string;
  resource?: string;
  systemId?: string;
  systemName?: string;
  vendorOrgNumber?: string;
};

/** Test-scoped data shared by the Playwright and accessibility reports. */
export class TestReportContext {
  private data: ReportContext = {};

  constructor(private readonly testInfo: TestInfo) {}

  get(): ReportContext {
    return structuredClone(this.data);
  }

  /** Replace the context explicitly when the test changes actor or scenario. */
  set(data: ReportContext) {
    this.data = structuredClone(data);
    for (const [label, value] of Object.entries(formatReportContext(data))) {
      const description = `${label}: ${value}`;
      if (
        !this.testInfo.annotations.some(
          (item) => item.type === 'testdata' && item.description === description,
        )
      ) {
        this.testInfo.annotations.push({ type: 'testdata', description });
      }
    }
  }
}
