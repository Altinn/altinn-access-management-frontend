import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';
import type { PartyEntity } from '@/dataObjects/dtos/Party';

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'lookup';

export const lookupApi = createApi({
  reducerPath: 'lookupApi',
  baseQuery: createBaseQuery(baseUrl),
  endpoints: (builder) => ({
    getOrganization: builder.query<PartyEntity, string>({
      query: (orgNumber) => `org/${orgNumber}`,
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    getPartyFromLoggedInUser: builder.query<PartyEntity, void>({
      query: () => `party/user`,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetOrganizationQuery, useGetPartyFromLoggedInUserQuery } = lookupApi;

export const { endpoints, reducerPath, reducer, middleware } = lookupApi;
