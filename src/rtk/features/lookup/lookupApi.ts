import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { PartyType } from '../userInfo/userInfoApi';

export type UserProfile = {
  userId: string;
  userUuid: string;
  userType: UserType;
  userName: string;
  phoneNumber: string;
  email: string;
  partyId: number;
  party: Party;
};

export type Party = {
  partyId: number;
  partyUuid: string;
  orgNumber?: string;
  ssn?: string;
  unitType?: string;
  name: string;
  partyTypeName: PartyType;
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

export interface Organization {
  orgNumber: string;
  name: string;
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
    getOrganization: builder.query<Organization, string>({
      query: (orgNumber) => `org/${orgNumber}`,
    }),
  }),
});

export const { useGetUserByUUIDQuery, useGetPartyByUUIDQuery, useGetOrganizationQuery } = lookupApi;

export const { endpoints, reducerPath, reducer, middleware } = lookupApi;
