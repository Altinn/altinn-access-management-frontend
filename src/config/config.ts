/**
 * Application configuration is obtained from three possible sources:
 * - fallback configuration (inline in this file)
 * - a JSON config object in a `<script type="application/json" id="altinn3-app-config">` element in the DOM
 * - VITE_* environment variables
 */

interface Config {
  backendApiUrl?: string;
  defaultLocale?: string;
  // other configurable keys here…
}

// --- Fallback configuration (if nothing else loads) ------------------------

const fallbackConfig: Config = {
  backendApiUrl: new URL(window.location.href).origin + '/api/',
  defaultLocale: 'no',
  // other configurable keys here…
};

// --- Environment configuration (from variables) ----------------------------

// You can define the VITE_* variables in a `/.env.local` file, which won't be committed to git
// @see https://vitejs.dev/guide/env-and-mode.html#env-files

const envConfig: Config = {
  backendApiUrl: import.meta.env.VITE_BACKEND_API_URL,
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE,
  // other configurable keys here…
};

for (const key in envConfig) {
  if (envConfig[key as keyof Config] === undefined) {
    delete envConfig[key as keyof Config];
  }
}

// ---------------------------------------------------------------------------

// Apply configuration (env vars override JSON, which overrides fallback)

const config: Config = { ...fallbackConfig, ...envConfig };

export function getConfig(key: keyof Config) {
  return config[key];
}
