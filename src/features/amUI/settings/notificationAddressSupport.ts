import { Environment, getEnv } from '@/resources/utils/pathUtils';

// The test environments only store notification addresses for organizations in Tenor,
// and those are the ones whose numbers start with 2 or 3
export const isNotificationAddressSupported = (orgNumber?: string | null) =>
  getEnv() === Environment.PROD || !orgNumber || /^[23]/.test(orgNumber);
