import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';
import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/bankruptcyestate`;

export const bankruptcyEstateApi = createApi({
  reducerPath: 'bankruptcyEstateApi',
  baseQuery: createBaseQuery(baseUrl),
  endpoints: (builder) => ({
    getHasAdminAccess: builder.query<boolean, void>({
      query: () => `hasadminaccess?party=${getCookie('AltinnPartyUuid')}`,
    }),
  }),
});

export const { useGetHasAdminAccessQuery } = bankruptcyEstateApi;

export const { endpoints, reducerPath, reducer, middleware } = bankruptcyEstateApi;
