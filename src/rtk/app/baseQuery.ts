import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { refreshToken } from '@/resources/Token/tokenUtils';

/**
 * Creates the base query shared by all api slices. Sets the headers the BFF expects, and checks the
 * JWT token whenever a request is rejected with 401 (e.g. the user has logged out in another tab).
 * An expired token redirects to login; otherwise the error is returned and handled as usual.
 */
export const createBaseQuery = (baseUrl: string): ReturnType<typeof fetchBaseQuery> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error?.status === 401) {
      await refreshToken();
    }
    return result;
  };
};
