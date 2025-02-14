import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

interface UserInfoApiResponse {
  party: {
    name: string;
  };
  userUuid: string;
}

interface UserInfo {
  name: string;
  uuid: string;
}

export interface ReporteeInfo {
  name: string;
  organizationNumber?: string;
  type?: string;
  partyUuid: string;
  authorizedRoles: string[];
}

export enum PartyType {
  None = 0,
  Person = 1,
  Organization = 2,
  SelfIdentified = 3,
}

export interface User {
  partyUuid: string;
  partyType: PartyType;
  name: string;
  registryRoles: string[];
  organizationNumber?: string;
  unitType?: string;
  inheritingUsers: User[];
}

export interface UserAccesses {
  accessPackages: string[];
  services: string[];
  roles: string[];
}

export const userInfoApi = createApi({
  reducerPath: 'userInfoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/accessmanagement/api/v1/user/',
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      query: () => 'profile',
      keepUnusedDataFor: 300,
      transformResponse: (response: UserInfoApiResponse) => {
        return { name: response.party.name, uuid: response.userUuid };
      },
    }),
    getReportee: builder.query<ReporteeInfo, void>({
      query: () => `reportee/${getCookie('AltinnPartyId')}`,
      keepUnusedDataFor: 300,
    }),
    getRightHolders: builder.query<User[], void>({
      query: () => `reportee/${getCookie('AltinnPartyId')}/rightholders`,
      keepUnusedDataFor: 300,
    }),
    getReporteeListForParty: builder.query<User[], void>({
      query: () => {
        const partyUuid = getCookie('AltinnPartyUuid');
        return `/reporteelist/${partyUuid}`;
      },
      keepUnusedDataFor: 300,
    }),
    getUserAccesses: builder.query<UserAccesses, { from: string; to: string }>({
      query: ({ from, to }) => `from/${from}/to/${to}/accesses`,
      keepUnusedDataFor: 300,
    }),
    validateNewUserPerson: builder.mutation<string, { ssn: string; lastName: string }>({
      query: ({ ssn, lastName }) => ({
        url: `reportee/${getCookie('AltinnPartyUuid')}/rightholder/validateperson`,
        method: 'POST',
        body: JSON.stringify({ ssn, lastName }),
        transformErrorResponse: (response: {
          status: string | number;
        }): { status: string | number } => {
          return { status: response.status };
        },
      }),
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useGetReporteeQuery,
  useGetRightHoldersQuery,
  useGetUserAccessesQuery,
  useValidateNewUserPersonMutation,
  useGetReporteeListForPartyQuery,
} = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
