import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DelegableApi {
  id: string;
  apiName: string;
  orgName: string;
  rightDescription: string;
  description?: string;
  scopes: string[];
}

export interface DelegableApiDto {
  title: string;
  identifier: string;
  resourceOwnername: string;
  rightDescription: string;
  description?: string;
  resourceReferences: resourceReferenceDTO[];
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

export interface SliceState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  presentedApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  delegableApiSearchPool: DelegableApi[];
  apiProviders: string[];
  error: string | undefined;
}

interface resourceReferenceDTO {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

const mapToDelegableApi = (obj: DelegableApiDto, orgName: string) => {
  const delegableApi: DelegableApi = {
    id: obj.identifier,
    apiName: obj.title,
    orgName,
    rightDescription: obj.rightDescription,
    description: obj.description,
    scopes: [],
  };
  for (const ref of obj.resourceReferences) {
    if (ref.referenceType === 'MaskinportenScope') {
      delegableApi.scopes.push(ref.reference);
    }
  }

  return delegableApi;
};

export const fetchDelegableApis = createAsyncThunk('delegableApi/fetchDelegableApis', async () => {
  const altinnPartyId = '1337';
  return await axios
    .get(`/accessmanagement/api/v1/${altinnPartyId}/resources/maskinportenschema`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw new Error(String(error.response.status));
    });
});

const initialState: SliceState = {
  loading: true,
  delegableApiList: [],
  presentedApiList: [],
  delegableApiSearchPool: [],
  apiProviders: [''],
  chosenDelegableApiList: [],
  error: '',
};

const delegableApiSlice = createSlice({
  name: 'delegableApi',
  initialState,
  reducers: {
    softAddApi: (state: SliceState, action) => {
      const { delegableApiList } = state;
      const { presentedApiList } = state;
      const { delegableApiSearchPool } = state;
      state.delegableApiList = delegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
      state.presentedApiList = presentedApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
      state.delegableApiSearchPool = delegableApiSearchPool.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );

      state.chosenDelegableApiList.push(action.payload);
    },
    softRemoveApi: (state: SliceState, action) => {
      state.delegableApiList.push(action.payload);
      state.presentedApiList.push(action.payload);
      state.delegableApiSearchPool.push(action.payload);

      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
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
      const seachWords = searchText ? searchText.split(' ') : [];

      const prioritizedApiList: DelegableApiWithPriority[] = [];
      if (searchText) {
        for (const api of delegableApiSearchPool) {
          let numMatches = 0;
          for (const word of seachWords) {
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
          .map(({ priority, ...otherAttr }) => otherAttr);
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
        state.error = action.error.message;
      });
  },
});

export default delegableApiSlice.reducer;
export const { softAddApi, softRemoveApi, search, filter, resetDelegableApis } =
  delegableApiSlice.actions;
