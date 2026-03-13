import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';

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
}

interface ResourceReference {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

export interface ServiceResource {
  title: string;
  identifier: string;
  resourceOwnerName: string;
  resourceOwnerLogoUrl: string;
  resourceOwnerOrgNumber: string;
  resourceOwnerOrgcode: string;
  rightDescription: string;
  description?: string;
  resourceReferences: ResourceReference[];
  authorizationReference: IdValuePair[];
  resourceType: string;
  delegable: boolean;
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
    getResource: builder.query<ServiceResource, string>({
      query: (resourceId) => encodeURIComponent(resourceId),
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
