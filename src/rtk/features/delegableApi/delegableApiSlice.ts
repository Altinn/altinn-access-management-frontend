import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';

export interface DelegableApi {
  id: string;
  apiName: string;
  orgName: string;
  rightsDescription: string;
  description?: string;
  scopes?: string[];
}

export interface DelegableApiResponse {
  identifier: string;
  title: {
    en: string;
    no: string;
    nn: string;
  };
  description: string;
}

export interface DelegableApiWithPriority {
  id: string;
  apiName: string;
  orgName: string;
  rightsDescription: string;
  description?: string;
  priority: number;
}

export interface SliceState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  presentedApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  delegableApiSearchPool: DelegableApi[];
  apiProviders: string[];
  error: string;
}

interface OrgName {
  en: string;
  nb: string;
  nn: string;
}

/* const initalApiList = () => {
  const list: DelegableApi[] = [];
  for (let i = 0; i < 100; i++) {
    list.push({
      id: i.toString(),
      apiName: 'API ' + i.toString(),
      orgName: 'Org' + (i % 10).toString(),
      description: 'Et api som gir deg info om ting' + i.toString(),
    });
  }
  return list;
}; */

const mapToDelegableApi = (obj: any, orgName: OrgName) => {
  console.log(obj);
  const delegableApi = {
    id: obj.identifier,
    apiName: obj.title.language,
    orgName: '',
    rightsDescription: '',
    description: obj.description,
    scopes: obj.scopes,
  };
  if (i18next.language === 'no_nb') {
    delegableApi.rightsDescription = obj.rightsDescription.nb;
    delegableApi.orgName = orgName.nb;
  } else if (i18next.language === 'en') {
    delegableApi.rightsDescription = obj.rightsDescription.en;
    delegableApi.orgName = orgName.en;
  } else {
    delegableApi.rightsDescription = obj.rightsDescription.nn;
    delegableApi.orgName = orgName.nn;
  }

  return delegableApi;
};

const initialOrgNames = () => {
  const list = [];
  for (let i = 0; i < 10; i++) {
    list.push('Org' + i.toString());
  }
  return list;
};

export const fetchDelegableApis = createAsyncThunk('delegableApi/fetchDelegableApis', async () => {
  return await axios
    .get('http://local.altinn.cloud/accessmanagement/api/v1/1337/resources/maskinportenschema', {})
    .then((response) => response.data)
    .catch((e) => console.log('error'));
});

/* const populateDelegableApis = () => {
  const dataArray = fetchDelegableApis();
  for (let i = 0; i < dataArray.length; i++) {
    const orgName = dataArray[i].hasCompetentAuthority.name;
    const rightsDescription = dataArray[i].rightsDescription;
    if (rightsDescription) {
      if (orgName) {
        state.presentedApiList.push(
          mapToDelegableApi(dataArray[i], dataArray[i].hasCompetentAuthority.name),
        );
      } else if (dataArray[i].owner) {
        state.presentedApiList.push(mapToDelegableApi(dataArray[i], dataArray[i].owner));
      }
    }
  }
}; */

const initialState: SliceState = {
  loading: false,
  delegableApiList: [],
  presentedApiList: [],
  delegableApiSearchPool: [],
  apiProviders: [],
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
              (api.apiName.toLowerCase().includes(word) ||
                api.description?.toLowerCase().includes(word)) ??
              api.orgName.toLowerCase().includes(word)
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
    builder.addCase(fetchDelegableApis.fulfilled, (state, action) => {
      state.loading = true;
      const dataArray = action.payload;
      console.log('inni løkke');
      console.log(dataArray);
      for (let i = 0; i < dataArray.length; i++) {
        const orgName = dataArray[i].hasCompetentAuthority.name;
        const rightsDescription = dataArray[i].rightsDescription;
        if (rightsDescription) {
          if (orgName) {
            state.presentedApiList.push(
              mapToDelegableApi(dataArray[i], dataArray[i].hasCompetentAuthority.name),
            );
          } else if (dataArray[i].owner) {
            state.presentedApiList.push(mapToDelegableApi(dataArray[i], dataArray[i].owner));
          }
        }
      }
      state.loading = false;
    });
  },
});

export default delegableApiSlice.reducer;
export const { softAddApi, softRemoveApi, search, filter, resetDelegableApis } =
  delegableApiSlice.actions;
