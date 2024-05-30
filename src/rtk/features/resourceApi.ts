import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface ResourceOwner {
  organisationName: string;
  organisationNumber: string;
}

export enum ResourceType {
  Default = 'Default',
  SystemResource = 'SystemResource',
  MaskinportenSchema = 'MaskinportenSchema',
  Altinn2Service = 'Altinn2Service',
  AltinnApp = 'AltinnApp',
  GenericAccessResource = 'GenericAccessResource',
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'resources';

export const resourceApi = createApi({
  reducerPath: 'resourceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['APIs'],
  endpoints: (builder) => ({
    getResourceOwners: builder.query<ResourceOwner[], ResourceType[] | void>({
      query: (resourceTypeList) => {
        return (
          'resourceowners?' +
          resourceTypeList?.reduce((url, type) => {
            return url + `&relevantResourceTypes=${type}`;
          }, '')
        );
      },
    }),
  }),
});

export const { useGetResourceOwnersQuery } = resourceApi;

export const { endpoints, reducerPath, reducer, middleware } = resourceApi;
