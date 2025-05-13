/**
 * Retrieves the value of a required environment variable.
 *
 * @param name - The name of the environment variable to retrieve.
 * @returns The value of the specified environment variable.
 *
 * @throws {Error} If the environment variable with the given {@link name} is not set or is falsy.
 */
export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable read from config with name: ${name}`);
  return value;
}
