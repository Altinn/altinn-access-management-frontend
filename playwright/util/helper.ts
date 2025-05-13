export function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable read from config with name: ${name}`);
  return value;
}
