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
    addAltinn2Account: builder.mutation<void, { userName: string; password: string }>({
      query: ({ userName, password }) => ({
        url: `altinn2account`,
        method: 'POST',
        body: { userName: userName, password: password },
      }),
    }),
    sendForgotPasswordEmail: builder.mutation<
      { maskedEmail: string },
      { userName: string; lang: string }
    >({
      query: ({ userName, lang }) => ({
        url: `altinn2account/forgotpassword`,
        method: 'POST',
        body: { userName: userName, language: lang },
      }),
    }),
    addAltinn2AccountFromToken: builder.mutation<string, { token: string }>({
      query: ({ token }) => ({
        url: `altinn2account/token`,
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
