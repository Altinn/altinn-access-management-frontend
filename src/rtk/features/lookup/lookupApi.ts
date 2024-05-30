import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export type UserProfile = {
  userId: string;
  userUUID: string;
  userType: UserType;
  userName: string;
  phoneNumber: string;
  email: string;
  partyId: number;
  party: Party;
};

export type Party = {
  partyId: number;
  partyUUID: string;
  orgNumber?: string;
  ssn?: string;
  unitType?: string;
  name: string;
};

export enum UserType {
  None,
  SSNIdentified,
  SelfIdentified,
  EnterpriseIdentified,
  AgencyUser,
  PSAN,
  PSA,
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'lookup';

export const lookupApi = createApi({
  reducerPath: 'lookupApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      const token = getCookie('XSRF-TOKEN');
      if (typeof token === 'string') {
        headers.set('X-XSRF-TOKEN', token);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserByUUID: builder.query<UserProfile, string>({
      query: (userUUID) => `user/${userUUID}`,
    }),
    getPartyByUUID: builder.query<Party, string>({
      query: (partyUUID) => `party/${partyUUID}`,
    }),
  }),
});

export const { useGetUserByUUIDQuery, useGetPartyByUUIDQuery } = lookupApi;

export const { endpoints, reducerPath, reducer, middleware } = lookupApi;
