import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DelegableApi {
  id: string;
  apiName: string;
  orgName: string;
  description: string;
}

export interface DelegableApiWithPriority {
  id: string;
  apiName: string;
  orgName: string;
  description: string;
  priority: number;
}

export interface SliceState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  presentedApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  delegableApiSearchPool: DelegableApi[];
  apiSuppliers: string[];
  error: string;
}

const initalApiList = () => {
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
};

const initialOrgNames = () => {
  const list = [];
  for (let i = 0; i < 10; i++) {
    list.push('Org' + i.toString());
  }
  return list;
};

const initialState: SliceState = {
  loading: false,
  delegableApiList: initalApiList(),
  presentedApiList: initalApiList(),
  delegableApiSearchPool: initalApiList(),
  apiSuppliers: initialOrgNames(),
  chosenDelegableApiList: [],
  error: '',
};

// example code for populating accordions later on
export const fetchDelegableApis = createAsyncThunk('delegableApi/fetchDelegableApis', async () => {
  return await axios
    .get('https://jsonplaceholder.typicode.com/users')
    .then((response) => response.data)
    .catch((error) => console.log(error));
});

const delegableApiSlice = createSlice({
  name: 'delegableApi',
  initialState,
  reducers: {
    softAdd: (state: SliceState, action: any) => {
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
    softRemove: (state: SliceState, action: any) => {
      state.delegableApiList.push(action.payload);
      state.presentedApiList.push(action.payload);
      state.delegableApiSearchPool.push(action.payload);

      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
    },
    filter: (state: SliceState, action: any) => {
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
    search: (state: SliceState, action: any) => {
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
              api.description.toLowerCase().includes(word) ||
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
  },
});

export default delegableApiSlice.reducer;
export const { softAdd, softRemove, search, filter } = delegableApiSlice.actions;
