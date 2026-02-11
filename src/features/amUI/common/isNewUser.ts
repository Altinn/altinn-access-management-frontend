const NEW_USER_MAX_AGE_MS = 60 * 60 * 1000;

export const isNewUser = (addedAt: string | undefined): boolean => {
  const parsedMs = Date.parse(addedAt ?? '');
  if (Number.isNaN(parsedMs)) {
    return false;
  }

  return Date.now() - parsedMs <= NEW_USER_MAX_AGE_MS;
};
