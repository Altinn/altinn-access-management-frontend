import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface ResourceOwner {
  organisationName: string | null;
  organisationNumber: string;
  organisationCode: string;
}

export enum ResourceType {
  Default = 'Default',
  SystemResource = 'SystemResource',
  MaskinportenSchema = 'MaskinportenSchema',
  Altinn2Service = 'Altinn2Service',
  AltinnApp = 'AltinnApp',
  GenericAccessResource = 'GenericAccessResource',
  BrokerService = 'BrokerService',
  CorrespondenceService = 'CorrespondenceService',
  Consent = 'Consent',
  MigratedApp = 'MigratedApp',
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'resources';

export const resourceApi = createApi({
  reducerPath: 'resourceApi',
  baseQuery: createBaseQuery(baseUrl),
  tagTypes: ['APIs'],
  endpoints: (builder) => ({
    getResource: builder.query<ServiceResource, string>({
      query: (resourceId) => ({
        url: '',
        params: { resourceId },
      }),
    }),
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

export const { useGetResourceQuery, useGetResourceOwnersQuery } = resourceApi;

export const { endpoints, reducerPath, reducer, middleware } = resourceApi;
