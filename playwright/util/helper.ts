import { Page } from '@playwright/test';
import { LoginPage } from 'playwright/pages/LoginPage';

export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable read from config with name: ${name}`);
  return value;
}

/**
 * Picks a random element from an array
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Creates a PID login function for a given page
 */
export function createPidLogin(page: Page) {
  return async (pid: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginAsActorPid(pid);
  };
}

/**
 * Adds time to the current UTC date and returns ISO string
 */
export function addTimeToNowUtc(opts: {
  minutes?: number;
  seconds?: number;
  days?: number;
  years?: number;
}): string {
  const now = new Date();
  if (opts.minutes) now.setUTCMinutes(now.getUTCMinutes() + opts.minutes);
  if (opts.seconds) now.setUTCSeconds(now.getUTCSeconds() + opts.seconds);
  if (opts.days) now.setUTCDate(now.getUTCDate() + opts.days);
  if (opts.years) now.setUTCFullYear(now.getUTCFullYear() + opts.years);
  return now.toISOString();
}

/**
 * Converts ISO/UTC string to Oslo UI format (DD.MM.YYYY HH:MM)
 */
export function formatUiDateTime(isoString: string): string {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Oslo',
  });
  const timePart = date.toLocaleTimeString('no-NO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Oslo',
  });
  return `${datePart} ${timePart}`;
}
