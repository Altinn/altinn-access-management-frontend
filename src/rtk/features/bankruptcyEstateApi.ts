import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';
import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/bankruptcyestate`;

export const bankruptcyEstateApi = createApi({
  reducerPath: 'bankruptcyEstateApi',
  baseQuery: createBaseQuery(baseUrl),
  endpoints: (builder) => ({
    getIsBankruptcyEstateAdmin: builder.query<boolean, void>({
      query: () => `isBankruptcyEstateAdmin?party=${getCookie('AltinnPartyUuid')}`,
    }),
  }),
});

export const { useGetIsBankruptcyEstateAdminQuery } = bankruptcyEstateApi;

export const { endpoints, reducerPath, reducer, middleware } = bankruptcyEstateApi;
