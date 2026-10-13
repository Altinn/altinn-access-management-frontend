import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';

import type { PartyType } from './userInfoApi';

export type Party = {
  partyId: number;
  partyUuid: string;
  orgNumber?: string;
  unitType?: string;
  name: string;
  partyTypeName: PartyType;
  dateOfBirth?: string;
  isDeleted?: boolean;
};

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'lookup';

export const lookupApi = createApi({
  reducerPath: 'lookupApi',
  baseQuery: createBaseQuery(baseUrl),
  endpoints: (builder) => ({
    getOrganization: builder.query<Party, string>({
      query: (orgNumber) => `org/${orgNumber}`,
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    getPartyFromLoggedInUser: builder.query<Party, void>({
      query: () => `party/user`,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetOrganizationQuery, useGetPartyFromLoggedInUserQuery } = lookupApi;

export const { endpoints, reducerPath, reducer, middleware } = lookupApi;
