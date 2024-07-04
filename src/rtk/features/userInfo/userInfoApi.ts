import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

interface UserInfoApiResponse {
  party: {
    name: string;
  };
}
interface ReporteeApiResponse {
  organizationNumber: any;
  name: string;
}

interface UserInfo {
  name: string;
}

interface ReporteeInfo {
  name: string;
  orgNumber?: string;
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
      transformResponse: (response: ReporteeApiResponse) => {
        return {
          name: response.name,
          orgNumber: response.organizationNumber,
        };
      },
    }),
  }),
});

export const { useGetUserInfoQuery, useGetReporteeQuery } = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
