import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

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

interface resourceOwnerParams {
  resourceTypeList: ResourceType[];
}

export const resourceOwnerApi = createApi({
  reducerPath: 'resourceOwnerApi',
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
    getResourceOwners: builder.query<ResourceOwner[], resourceOwnerParams>({
      query: (args) => {
        const { resourceTypeList } = args;
        let resourceTypesUrl = '';
        for (const type of resourceTypeList) {
          resourceTypesUrl = resourceTypesUrl + `&relevantResourceTypes=${type}`;
        }
        return `resources/getResourceOwners?${resourceTypesUrl}`;
      },
    }),
  }),
});

export const { useGetResourceOwnersQuery } = resourceOwnerApi;

export const { endpoints, reducerPath, reducer, middleware } = resourceOwnerApi;
