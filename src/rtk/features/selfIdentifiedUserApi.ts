import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/selfidentifieduser`;

export const selfIdentifiedUserApi = createApi({
  reducerPath: 'selfIdentifiedUserApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['clients', 'agents', 'agentAccessPackages', 'clientAccessPackages', 'myClients'],
  endpoints: (builder) => ({
    addAltinn2Account: builder.mutation<void, { to: string; userName: string; password: string }>({
      query: ({ to, userName, password }) => ({
        url: `altinn2account?to=${to}`,
        method: 'POST',
        body: { userName: userName, password: password },
      }),
    }),
    sendForgotPasswordEmail: builder.mutation<string, { userName: string }>({
      query: ({ userName }) => ({
        url: `altinn2account/forgotpassword`,
        method: 'POST',
        body: { userName: userName },
      }),
    }),
    addAltinn2AccountFromToken: builder.mutation<string, { to: string; token: string }>({
      query: ({ to, token }) => ({
        url: `altinn2account/token?to=${to}`,
        method: 'POST',
        body: { token: token },
      }),
    }),
  }),
});

export const {
  useAddAltinn2AccountMutation,
  useSendForgotPasswordEmailMutation,
  useAddAltinn2AccountFromTokenMutation,
} = selfIdentifiedUserApi;

export const { endpoints, reducerPath, reducer, middleware } = selfIdentifiedUserApi;
