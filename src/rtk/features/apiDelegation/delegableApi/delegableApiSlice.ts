import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { type CustomError } from '@/dataObjects';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { ErrorCode } from '@/resources/utils/errorCodeUtils';

export interface DelegableApi {
  identifier: string;
  apiName: string;
  orgName: string;
  rightDescription: string;
  description?: string;
  scopes: string[];
  isLoading: boolean;
  errorCode: string | undefined;
  authorizationReference: IdValuePair[];
}

export interface DelegableApiDto {
  title: string;
  identifier: string;
  resourceOwnername: string;
  rightDescription: string;
  description?: string;
  resourceReferences?: resourceReferenceDTO[];
  authorizationReference: IdValuePair[];
}

export interface DelegableApiWithPriority {
  id: string;
  apiName: string;
  orgName: string;
  rightDescription: string;
  description?: string;
  scopes: string[];
  priority: number;
}

interface resourceReferenceDTO {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

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

export const fetchDelegableApis = createAsyncThunk(
  'delegableApi/fetchDelegableApis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/accessmanagement/api/v1/resources/maskinportenschema`);
      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  },
);

export const apiDelegationCheck = createAsyncThunk(
  'delegableApi/apiDelegationCheck',
  async (dto: DelegableApi, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    const right = {
      resource: [
        {
          id: dto.authorizationReference[0].id,
          value: dto.authorizationReference[0].value,
        },
      ],
    };

    return await axios
      .post(`/accessmanagement/api/v1/${altinnPartyId}/maskinportenschema/delegationcheck`, right)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        return rejectWithValue(error);
      });
  },
);

export interface SliceState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  presentedApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  delegableApiSearchPool: DelegableApi[];
  apiProviders: string[];
  error: CustomError;
}

const initialState: SliceState = {
  loading: true,
  delegableApiList: [],
  presentedApiList: [],
  delegableApiSearchPool: [],
  apiProviders: [''],
  chosenDelegableApiList: [],
  error: {
    message: '',
    statusCode: '',
  },
};

const delegableApiSlice = createSlice({
  name: 'delegableApi',
  initialState,
  reducers: {
    softRemoveApi: (state: SliceState, action) => {
      state.delegableApiList.push(action.payload);
      state.presentedApiList.push(action.payload);
      state.delegableApiSearchPool.push(action.payload);

      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.identifier !== action.payload.identifier,
      );
    },
    filter: (state: SliceState, action) => {
      const { delegableApiList } = state;
      const filterList = action.payload;
      let searchPool = [...delegableApiList];
      if (filterList && filterList.length > 0) {
        searchPool = delegableApiList.filter((api) =>
          filterList.some((filter: string) => {
            if (api.orgName.toLocaleLowerCase().includes(filter.toLowerCase())) {
              return true;
            }
            return false;
          }),
        );
        state.delegableApiSearchPool = searchPool;
      } else {
        state.delegableApiSearchPool = delegableApiList;
      }
    },
    search: (state: SliceState, action) => {
      const { delegableApiSearchPool } = state;
      const searchText = action.payload.trim().toLowerCase();
      const searchWords = searchText ? searchText.split(' ') : [];

      const prioritizedApiList: DelegableApiWithPriority[] = [];
      if (searchText) {
        for (const api of delegableApiSearchPool) {
          let numMatches = 0;
          for (const word of searchWords) {
            if (
              api.apiName.toLowerCase().includes(word) ||
              (api.description?.toLowerCase().includes(word) ??
                api.rightDescription?.toLowerCase().includes(word)) ||
              api.orgName.toLowerCase().includes(word) ||
              api.scopes?.find((scope) => scope.includes(word))
            ) {
              numMatches++;
            }
          }
          if (numMatches > 0) {
            prioritizedApiList.push({ ...api, priority: numMatches });
          }
        }

        state.presentedApiList = prioritizedApiList
          .sort((a, b) => (a.priority < b.priority ? 1 : -1))
          .map(({ ...otherAttr }) => otherAttr);
      } else {
        state.presentedApiList = delegableApiSearchPool;
      }
    },
    resetDelegableApis: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDelegableApis.fulfilled, (state, action) => {
        const dataArray = action.payload;
        const responseList: DelegableApi[] = [];
        const providerList: string[] = [];
        for (let i = 0; i < dataArray.length; i++) {
          const apiName = dataArray[i].title;
          const orgName = dataArray[i].resourceOwnerName;
          const rightDescription = dataArray[i].rightDescription;
          if (rightDescription && apiName) {
            if (orgName) {
              responseList.push(mapToDelegableApi(dataArray[i], dataArray[i].resourceOwnerName));
              if (!providerList.includes(orgName)) {
                providerList.push(orgName);
              }
            }
          }
        }
        state.delegableApiList = responseList;
        state.delegableApiSearchPool = responseList;
        state.presentedApiList = responseList;
        state.apiProviders = providerList.sort((a, b) => a.localeCompare(b));
        state.loading = false;
      })
      .addCase(fetchDelegableApis.rejected, (state, action) => {
        state.error.statusCode = String(action.payload?.response?.status) ?? 'Unknown code';
        if (state.error?.statusCode === '400') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else if (state.error?.statusCode === '500') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else {
          state.error.message = 'Unknown error';
        }
      })
      .addCase(apiDelegationCheck.pending, (state, action) => {
        const dto: DelegableApi = action.meta.arg;
        const apiIdentifier = dto.authorizationReference[0].value;

        state.delegableApiSearchPool = state.delegableApiSearchPool.map((api: DelegableApi) => {
          if (api.identifier === apiIdentifier) {
            api.isLoading = true;
          }
          return api;
        });
      })
      .addCase(apiDelegationCheck.fulfilled, (state, action) => {
        const dto: DelegableApi = action.meta.arg;
        const apiIdentifier = dto.authorizationReference[0].value;

        if (action.payload[0].status === 'Delegable') {
          state.delegableApiList = state.delegableApiList.filter(
            (delegableApi) => dto.identifier !== delegableApi.identifier,
          );
          state.presentedApiList = state.presentedApiList.filter(
            (delegableApi) => dto.identifier !== delegableApi.identifier,
          );
          state.delegableApiSearchPool = state.delegableApiSearchPool.filter(
            (delegableApi) => dto.identifier !== delegableApi.identifier,
          );

          state.chosenDelegableApiList.push(dto);
        } else {
          const nextStateArray: DelegableApi[] = state.presentedApiList.map((api: DelegableApi) => {
            if (api.identifier === apiIdentifier) {
              api.isLoading = false;
              api.errorCode = action.payload[0].details[0].code;
            }
            return api;
          });

          state.delegableApiSearchPool = nextStateArray;
        }
      })
      .addCase(apiDelegationCheck.rejected, (state, action) => {
        const dto: DelegableApi = action.meta.arg;
        const apiIdentifier = dto.authorizationReference[0].value;

        const nextStateArray: DelegableApi[] = state.presentedApiList.map((api: DelegableApi) => {
          if (api.identifier === apiIdentifier) {
            api.isLoading = false;
            api.errorCode = ErrorCode.HTTPError;
          }
          return api;
        });

        state.delegableApiSearchPool = nextStateArray;
      });
  },
});

export default delegableApiSlice.reducer;
export const { softRemoveApi, search, filter, resetDelegableApis } = delegableApiSlice.actions;
