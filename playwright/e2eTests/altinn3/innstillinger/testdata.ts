import { loadTestdata } from 'playwright/util/testdata';

// Each test has a dedicated company profile admin and organisation to avoid parallel conflicts.
// In `ikkeAdmin` the admin grants the user access to the organisation without company profile admin rights.
export const TESTDATA = loadTestdata('innstillinger');

export const BASELINE_EPOST = 'playwright-baseline@example.com';
