import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Environment } from '@/resources/utils/pathUtils';

import { isNotificationAddressSupported } from './notificationAddressSupport';

let env: Environment;

vi.mock('@/resources/utils/pathUtils', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getEnv: () => env,
}));

describe('isNotificationAddressSupported', () => {
  beforeEach(() => {
    env = Environment.AT22;
  });

  it('supports organizations in Tenor in the test environments', () => {
    expect(isNotificationAddressSupported('212345678')).toBe(true);
    expect(isNotificationAddressSupported('312345678')).toBe(true);
  });

  it('does not support other organizations in the test environments', () => {
    expect(isNotificationAddressSupported('912345678')).toBe(false);
    expect(isNotificationAddressSupported('012345678')).toBe(false);
  });

  it('supports every organization in production', () => {
    env = Environment.PROD;

    expect(isNotificationAddressSupported('912345678')).toBe(true);
  });

  it('does not block before the organization is known', () => {
    expect(isNotificationAddressSupported(undefined)).toBe(true);
  });
});
