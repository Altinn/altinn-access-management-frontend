// eslint-disable-next-line import/default
import dotenv from 'dotenv';
import path from 'path';

export function env(name: string): string {
  const value = process.env[name];
  if (value === undefined)
    throw new Error(`Missing required env variable read from config with name: ${name}`);
  return value;
}

/**
 * Loads the playwright/config .env files for a given environment, in the same
 * order and with the same override semantics as playwright.config.ts:
 *   .env -> .env.<env> -> .env.local -> .env.<env>.local
 *
 * Shared by the standalone Tenor CLIs (run via tsx) so they don't each re-declare
 * their own loader. Pass `override: false` to keep already-set process.env values
 * (used when re-loading per environment in multi-env scripts).
 */
export function loadEnv(envName: string, { override = true }: { override?: boolean } = {}): void {
  const configDir = path.join(__dirname, '..', 'config');
  dotenv.config({
    path: [
      path.join(configDir, '.env'),
      path.join(configDir, `.env.${envName}`),
      path.join(configDir, '.env.local'),
      path.join(configDir, `.env.${envName}.local`),
    ],
    override,
  });
}

/**
 * Picks a random element from an array
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Fills the {{poa_object}} placeholder in a localization string,
 * e.g. "Gi fullmakt for {{poa_object}}" -> "Gi fullmakt for Veitransport".
 */
export function withPoaObject(template: string, poaObject: string): string {
  return template.replace('{{poa_object}}', poaObject);
}

/**
 * Fills the {{customerName}} placeholder in a localization string,
 * e.g. "Legg til {{customerName}} i systemtilgang" -> "Legg til Ola i systemtilgang".
 */
export function withCustomerName(template: string, customerName: string): string {
  return template.replace('{{customerName}}', customerName);
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
 * Converts ISO/UTC string to date format (DD.MM.YYYY HH:MM)
 */
export function formatUiDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
