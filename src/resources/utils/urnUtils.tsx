export const isGuardianshipUrn = (urn: string) => {
  return (
    urn.startsWith('urn:altinn:accesspackage:vergemal') ||
    urn.startsWith('accesspackage:area:vergemal')
  );
};
