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
      (response) => {
        if (!response.ok) {
          window.location.href = getLoginUrl();
        }
      },
      () => {
        // Network error, or the request was aborted by a navigation (Safari and Firefox reject
        // in-flight fetches when the page navigates). That is no proof the token is invalid, and
        // redirecting here would override the navigation the user started.
      },
    )
    .finally(() => {
      pendingRefresh = undefined;
    });
  return pendingRefresh;
};
