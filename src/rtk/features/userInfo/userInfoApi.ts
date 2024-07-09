import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

interface UserInfoApiResponse {
  party: {
    name: string;
  };
}

interface UserInfo {
  name: string;
}

interface ReporteeInfo {
  name: string;
  organizationNumber?: string;
}

enum PartyType {
  None,
  Person,
  Organization,
  SelfIdentified,
}

interface RightHolder {
  partyUuid: string;
  partyType: PartyType;
  name: string;
  registryRoles: string[];
  personId?: string;
  organizationNumber?: string;
  unitType?: string;
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
        return { name: response.party.name };
      },
    }),
    getReportee: builder.query<ReporteeInfo, void>({
      query: () => `reporteelist/${getCookie('AltinnPartyId')}`,
      keepUnusedDataFor: 300,
    }),
    getRightHolders: builder.query<RightHolder[], void>({
      query: () => `reportee/${getCookie('AltinnPartyId')}/rightholders`,
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetUserInfoQuery, useGetReporteeQuery, useGetRightHoldersQuery } = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
