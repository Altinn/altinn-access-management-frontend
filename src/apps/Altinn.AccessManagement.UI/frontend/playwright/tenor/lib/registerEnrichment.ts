import { RegisterApiRequests } from '../client/RegisterApiRequests';

/** Preserve Tenor rows and order, including rows absent from this environment. */
export async function enrichWithRegister<T>(
  rows: T[],
  identifier: (row: T) => string,
  environment: string,
  leaderIdentifier?: (row: T) => string | null | undefined,
) {
  const identifiers = rows.flatMap((row) => {
    const leader = leaderIdentifier?.(row);
    return leader ? [identifier(row), leader] : [identifier(row)];
  });
  const parties = await new RegisterApiRequests(environment).lookup(identifiers);
  const missing = new Set(identifiers.filter((id) => !parties.has(id))).size;
  if (missing)
    console.error(`Register (${environment}): ${missing} identifikatorer mangler; altinn = null.`);
  return rows.map((row) => ({
    ...row,
    altinn: parties.get(identifier(row)) ?? null,
    altinnEnvironment: environment,
    ...(leaderIdentifier
      ? { dagligLederAltinn: parties.get(leaderIdentifier(row) ?? '') ?? null }
      : {}),
  }));
}
