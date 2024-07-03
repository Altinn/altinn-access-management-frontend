import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

interface UserInfoResponse {
  party: {
    name: string;
  };
}
interface ReporteeResponse {
  name: string;
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
    getUserInfo: builder.query<any, void>({
      query: () => 'profile',
      keepUnusedDataFor: 300,
      transformResponse: (response: UserInfoResponse) => {
        return { name: response.party.name };
      },
    }),
    getReportee: builder.query<any, void>({
      query: () => `reporteelist/${getCookie('AltinnPartyId')}`,
      keepUnusedDataFor: 300,
      transformResponse: (response: ReporteeResponse) => {
        return { name: response.name };
      },
    }),
  }),
});

export const { useGetUserInfoQuery, useGetReporteeQuery } = userInfoApi;

export const { endpoints, reducerPath, reducer, middleware } = userInfoApi;
