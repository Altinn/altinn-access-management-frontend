import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Party } from './lookupApi';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface Entity {
  id: string;
  typeId: string;
  variantId: string;
  name: string;
  refId: string;
  parentId: string | null;
}

export interface Role {
  id: string;
  entityTypeId: string;
  providerId: string;
  name: string;
  code: string;
  description: string;
  isKeyRole: boolean;
  urn: string;
}

export interface Rightholder {
  from: Entity;
  role: Role;
  to: Entity;
  facilitator: Entity | null;
  facilitatorRole: Role | null;
  id: string;
  fromId: string;
  roleId: string;
  toId: string;
  facilitatorId: string | null;
  facilitatorRoleId: string | null;
  source: string;
  isDirect: boolean;
  isParent: boolean;
  isRoleMap: boolean;
  isKeyRole: boolean;
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
}

export enum PartyType {
  None = 'None',
  Person = 'Person',
  Organization = 'Organization',
  SelfIdentified = 'SelfIdentified',
}

export interface User {
  partyUuid: string;
  partyType: PartyType;
  name: string;
  roles: string[];
  organizationNumber?: string;
  unitType?: string;
  inheritingUsers: User[];
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
    // getRightHolders: builder.query<User[], void>({
    //   query: () => `reportee/${getCookie('AltinnPartyId')}/rightholders`,
    //   keepUnusedDataFor: 300,
    // }),
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
    getRightHolders: builder.query<User[], { partyUuid: string; fromUuid: string; toUuid: string }>(
      {
        query: ({ partyUuid, fromUuid, toUuid }) =>
          `rightholders?party=${partyUuid}&from=${fromUuid}&to=${toUuid}`,
        keepUnusedDataFor: 300,
      },
    ),
    removeRightHolder: builder.mutation<void, string>({
      query: (partyUuidToBeRemoved) => ({
        url: `reportee/${getCookie('AltinnPartyUuid')}/rightholder?rightholderPartyUuid=${partyUuidToBeRemoved}`,
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
  useLazyGetRightHoldersQuery,
  useAddRightHolderMutation,
  useRemoveRightHolderMutation,
  useGetUserAccessesQuery,
  useValidateNewUserPersonMutation,
  useGetReporteeListForPartyQuery,
  useGetReporteeListForAuthorizedUserQuery,
} = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
