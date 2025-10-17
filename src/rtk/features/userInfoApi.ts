import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { Party } from './lookupApi';
import { Entity } from '@/dataObjects/dtos/Common';
import { Connection } from './connectionApi';

interface UserKeyValues {
  OrganizationIdentifier?: string;
  PartyId?: string;
  DateOfBirth?: string;
}

export interface ExtendedUser extends Omit<User, 'children'> {
  roles: RoleInfo[];
  children: (ExtendedUser | User)[] | null;
  matchInChildren?: boolean;
  isInherited?: boolean;
}

export interface User {
  id: string;
  name: string;
  type?: string;
  variant?: string;
  children: (User | ExtendedUser)[] | null;
  keyValues: UserKeyValues | null;
  parent?: ExtendedUser | null;
}

export interface RoleInfo {
  id: string;
  code?: string;
  viaParty?: Entity;
}

interface UserInfoApiResponse {
  party: Party;
  userUuid: string;
}

export interface UserInfo {
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
  onlyHierarchyElementWithNoAccess: boolean;
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
    getReporteeListForParty: builder.query<User[], void>({
      query: () => {
        const partyUuid = getCookie('AltinnPartyUuid');
        return `/reporteelist/${partyUuid}`;
      },
      keepUnusedDataFor: 300,
    }),
    getReporteeListForAuthorizedUser: builder.query<ReporteeInfo[], void>({
      query: () => {
        return '/actorlist/old';
      },
      keepUnusedDataFor: 300,
    }),
    getActorListForAuthorizedUser: builder.query<Connection[], void>({
      query: () => {
        return '/actorlist';
      },
      keepUnusedDataFor: 300,
    }),
    getFavoriteActorUuids: builder.query<string[], void>({
      query: () => {
        return '/actorlist/favorites';
      },
      keepUnusedDataFor: 300,
    }),
    getIsAdmin: builder.query<boolean, void>({
      query: () => `isAdmin?party=${getCookie('AltinnPartyUuid')}`,
    }),
    getIsClientAdmin: builder.query<boolean, void>({
      query: () => `isClientAdmin?party=${getCookie('AltinnPartyUuid')}`,
    }),
    getIsCompanyProfileAdmin: builder.query<boolean, void>({
      query: () => `isCompanyProfileAdmin?party=${getCookie('AltinnPartyUuid')}`,
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useGetReporteeQuery,
  useGetReporteeListForPartyQuery,
  useGetReporteeListForAuthorizedUserQuery,
  useGetActorListForAuthorizedUserQuery,
  useGetFavoriteActorUuidsQuery,
  useGetIsAdminQuery,
  useGetIsClientAdminQuery,
  useGetIsCompanyProfileAdminQuery,
} = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
