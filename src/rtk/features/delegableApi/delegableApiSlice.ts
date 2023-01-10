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
  apiProviders: string[];
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
  apiProviders: initialOrgNames(),
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
    softAdd: (state: SliceState, action) => {
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

    softRemove: (state: SliceState, action) => {
      // Possible BUG here: even if the user just softRemoved item A
      // it doesn't mean that he wants it to be missing from the list
      // in the next moment --> I think I have seen that a deleted item A
      // is missing from the list to chose from... must be reproduced
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
      const seachWords = searchText ? searchText.split(' ') : []; // BUG seachWords (sic)...

      // NOTE: Several other BUGS also present in SearchField when using space before and after searchString "99 98"
      // 1) Sometimes a punktuation mark is automatically added. Might be a browser setting?
      // 2) "99 98" works --> finds API 99 and API 98, but "99  98" (i.e. two spaces) fails. Actually
      // it seems to fail if the space is added in the middle, to an existing "99 98" string... probably
      // a trim() function what needs to be fixed --> possibly trim() after split() might work

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
