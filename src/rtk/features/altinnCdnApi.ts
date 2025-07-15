import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface OrgData {
  orgs: OrgData | Promise<OrgData>;
  name: Record<string, string> | null;
  logo: string | null;
  emblem: string | null;
  orgnr: string | null;
  homepage: string | null;
  environments: string[] | null;
  contact: OrgContact | null;
}

export interface OrgContact {
  phone: string | null;
  url: string | null;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/cdn`;

export const altinnCdnApi = createApi({
  reducerPath: 'altinnCdnApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOrgData: builder.query<Record<string, OrgData>, void>({
      query: () => `orgdata`,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetOrgDataQuery } = altinnCdnApi;

export const { endpoints, reducerPath, reducer, middleware } = altinnCdnApi;
