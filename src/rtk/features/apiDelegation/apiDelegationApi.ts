import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import type {
  ApiDelegationResult,
  DelegationAccessResult,
  ResourceReference,
} from '@/dataObjects/dtos/resourceDelegation';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { Organization } from '../lookup/lookupApi';

import type { DelegableApi } from './delegableApi/delegableApiSlice';

export interface BatchApiDelegationRequest {
  partyId: string;
  apis: DelegableApi[];
  orgs: Organization[];
}

interface searchParams {
  searchString: string;
  ROfilters: string[];
}

interface resourceReferenceDTO {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

export interface DelegableApiDto {
  title: string;
  identifier: string;
  resourceOwnerName: string;
  rightDescription: string;
  description?: string;
  resourceReferences?: resourceReferenceDTO[];
  authorizationReference: IdValuePair[];
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

const mapToDelegableApi = (obj: DelegableApiDto, orgName: string) => {
  const delegableApi: DelegableApi = {
    identifier: obj.identifier,
    apiName: obj.title,
    orgName,
    rightDescription: obj.rightDescription,
    description: obj.description,
    scopes: [],
    authorizationReference: obj.authorizationReference,
    isLoading: false,
    errorCode: '',
  };
  if (obj.resourceReferences) {
    for (const ref of obj.resourceReferences) {
      if (ref.referenceType === 'MaskinportenScope') {
        delegableApi.scopes.push(ref.reference);
      }
    }
  }

  return delegableApi;
};

export const apiDelegationApi = createApi({
  reducerPath: 'apiDelegationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['APIs', 'overviewOrg'],
  endpoints: (builder) => ({
    // TODO: Move to resourceApi
    search: builder.query<DelegableApi[], searchParams>({
      query: (args) => {
        const { searchString, ROfilters } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/maskinportenapi/search?SearchString=${searchString}${filterUrl}`;
      },
      transformResponse: (response: DelegableApiDto[]) => {
        return response
          .filter((item) => item.rightDescription && item.title && item.resourceOwnerName)
          .map((item) => mapToDelegableApi(item, item.resourceOwnerName));
      },
    }),
    delegationCheck: builder.mutation<
      DelegationAccessResult,
      { partyId: string; resourceRef: ResourceReference }
    >({
      query: ({ partyId, resourceRef }) => ({
        url: `apidelegation/${partyId}/delegationcheck`,
        method: 'POST',
        body: JSON.stringify(resourceRef),
      }),
      transformResponse: (response: DelegationAccessResult[]) => {
        return response[0];
      },
      transformErrorResponse: (response: { status: string | number }) => {
        return response.status;
      },
    }),
    postApiDelegation: builder.mutation<ApiDelegationResult[], BatchApiDelegationRequest>({
      query: ({ partyId, apis, orgs }) => ({
        url: `apidelegation/${partyId}/offered/batch`,
        method: 'POST',
        body: JSON.stringify({
          apiIdentifiers: apis.map((api) => api.identifier),
          orgNumbers: orgs.map((org) => org.orgNumber),
        }),
      }),
      invalidatesTags: ['overviewOrg'],
      transformResponse: (response: ApiDelegationResult[], _meta, args) => {
        return response.map((d) => {
          return {
            orgNumber: d.orgNumber,
            orgName: args.orgs.find((org) => org.orgNumber === d.orgNumber)?.name || '',
            apiId: d.apiId,
            apiName: args.apis.find((api) => api.identifier === d.apiId)?.apiName || '',
            success: d.success,
          };
        });
      },
      transformErrorResponse: (response: { status: string | number }) => {
        return response.status;
      },
    }),
  }),
});

export const { useDelegationCheckMutation, useSearchQuery, usePostApiDelegationMutation } =
  apiDelegationApi;
