import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface AccessArea {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  accessPackages: AccessPackage[];
}

export interface AccessPackage {
  id: string;
  name: string;
  description: string;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'accesspackage';

export const accessPackageApi = createApi({
  reducerPath: 'accessPackageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['AccessPackages'],
  endpoints: (builder) => ({
    search: builder.query<AccessArea[], string>({
      query: (searchString) => {
        return `search?&searchString=${searchString}`;
      },
    }),
  }),
});

export const { useSearchQuery } = accessPackageApi;

export const { endpoints, reducerPath, reducer, middleware } = accessPackageApi;
