import { getLoginUrl } from '../utils/pathUtils';

const refreshUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/authentication/refresh`;

let pendingRefresh: Promise<void> | undefined;

/**
 * Refreshes the JWT token cookie. If the token can no longer be refreshed (it has expired or the
 * user has logged out elsewhere), the user is redirected to login. Concurrent calls share one request.
 */
export const refreshToken = (): Promise<void> => {
  pendingRefresh ??= fetch(refreshUrl)
    .then(
      (response) => response.ok,
      () => false,
    )
    .then((tokenIsValid) => {
      if (!tokenIsValid) {
        window.location.href = getLoginUrl();
      }
    })
    .finally(() => {
      pendingRefresh = undefined;
    });
  return pendingRefresh;
};
