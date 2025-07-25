import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { Party } from './lookupApi';

interface UserKeyValues {
  OrganizationIdentifier?: string;
  PartyId?: string;
  DateOfBirth?: string;
}

export interface ExtendedUser extends Omit<User, 'children'> {
  roles: RoleInfo[];
  children: (ExtendedUser | User)[] | null;
  matchInChildren?: boolean;
}

export interface User {
  id: string;
  name: string;
  type?: string;
  variant?: string;
  children: (User | ExtendedUser)[] | null;
  keyValues: UserKeyValues | null;
}

export interface RoleInfo {
  id: string;
  code?: string;
}

export interface Connection {
  party: User;
  roles: RoleInfo[];
  connections: Connection[];
}

interface UserInfoApiResponse {
  party: Party;
  userUuid: string;
}

interface UserInfo {
  name: string;
  uuid: string;
  party: Party;
}

export interface ReporteeInfo {
  name: string;
  organizationNumber?: string;
  type?: string;
  partyUuid: string;
  partyId: string;
  authorizedRoles: string[];
  subunits?: ReporteeInfo[];
}

export enum PartyType {
  Person = 1,
  Organization = 2,
  SelfIdentified = 3,
  SubUnit = 4,
}

export interface UserAccesses {
  accessPackages: string[];
  services: string[];
  roles: string[];
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/user`;

export const userInfoApi = createApi({
  reducerPath: 'userInfoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['UserInfo', 'RightHolders'],
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      query: () => 'profile',
      keepUnusedDataFor: 300,
      transformResponse: (response: UserInfoApiResponse) => {
        return { name: response.party.name, uuid: response.userUuid, party: response.party };
      },
    }),
    getReportee: builder.query<ReporteeInfo, void>({
      query: () => `reportee/${getCookie('AltinnPartyId')}`,
      keepUnusedDataFor: 300,
    }),
    addRightHolder: builder.mutation<void, string>({
      query: (partyUuidToBeAdded) => ({
        url: `reportee/${getCookie('AltinnPartyUuid')}/rightholder?rightholderPartyUuid=${partyUuidToBeAdded}`,
        method: 'POST',
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    getRightHolders: builder.query<
      Connection[],
      { partyUuid: string; fromUuid?: string; toUuid?: string }
    >({
      query: ({ partyUuid, fromUuid, toUuid }) =>
        `rightholders?party=${partyUuid}&from=${fromUuid}&to=${toUuid}`,
      keepUnusedDataFor: 3,
      providesTags: ['RightHolders'],
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    removeRightHolder: builder.mutation<void, { party: string; to: string; from: string }>({
      query: ({ party, to, from }) => ({
        url: `reportee?party=${party}&to=${to}&from=${from}`,
        method: 'DELETE',
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    getReporteeListForParty: builder.query<User[], void>({
      query: () => {
        const partyUuid = getCookie('AltinnPartyUuid');
        return `/reporteelist/${partyUuid}`;
      },
      keepUnusedDataFor: 300,
    }),
    getReporteeListForAuthorizedUser: builder.query<ReporteeInfo[], void>({
      query: () => {
        return '/actorlist';
      },
      keepUnusedDataFor: 300,
    }),
    getUserAccesses: builder.query<UserAccesses, { from: string; to: string }>({
      query: ({ from, to }) => `from/${from}/to/${to}/accesses`,
      keepUnusedDataFor: 300,
    }),
    getIsAdmin: builder.query<boolean, void>({
      query: () => `isAdmin?party=${getCookie('AltinnPartyUuid')}`,
    }),
    validateNewUserPerson: builder.mutation<string, { ssn: string; lastName: string }>({
      query: ({ ssn, lastName }) => ({
        url: `reportee/${getCookie('AltinnPartyUuid')}/rightholder/validateperson`,
        method: 'POST',
        body: JSON.stringify({ ssn, lastName }),
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number } => {
        return { status: response.status };
      },
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useGetReporteeQuery,
  useGetRightHoldersQuery,
  useAddRightHolderMutation,
  useRemoveRightHolderMutation,
  useGetUserAccessesQuery,
  useValidateNewUserPersonMutation,
  useGetReporteeListForPartyQuery,
  useGetReporteeListForAuthorizedUserQuery,
  useGetIsAdminQuery,
} = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
