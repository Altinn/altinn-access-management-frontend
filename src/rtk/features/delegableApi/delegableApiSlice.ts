import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DelegableApi {
  id: string;
  name: string;
  orgName: string;
  description: string;
}

export interface DelegableApiWithPriority {
  id: string;
  name: string;
  orgName: string;
  description: string;
  priority: number;
}

export interface SearchProps {
  id: boolean;
  name: boolean;
  orgName: boolean;
  description: boolean;
}

export interface SliceState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  presentedApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  error: string;
}

const initialState: SliceState = {
  loading: false,
  delegableApiList: [
    {
      id: '1',
      name: 'API A',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatteklasser',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '3',
      name: 'API C',
      orgName: 'CakeBoss',
      description: 'For å hente ut kake',
    },
    {
      id: '4',
      name: 'API D',
      orgName: 'Isbil',
      description: 'For å hente ut is',
    },
    {
      id: '5',
      name: 'API E',
      orgName: 'Bama',
      description: 'Frukt av alle slag',
    },
  ],
  presentedApiList: [
    {
      id: '1',
      name: 'API A',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatteklasser',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '3',
      name: 'API C',
      orgName: 'CakeBoss',
      description: 'For å hente ut kake',
    },
    {
      id: '4',
      name: 'API D',
      orgName: 'Isbil',
      description: 'For å hente ut is',
    },
    {
      id: '5',
      name: 'API E',
      orgName: 'Bama',
      description: 'Frukt av alle slag',
    },
  ],
  chosenDelegableApiList: [],
  error: '',
};

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
      state.delegableApiList = delegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
      state.presentedApiList = presentedApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );

      state.chosenDelegableApiList.push(action.payload);
    },
    softRemove: (state: SliceState, action: any) => {
      state.delegableApiList.push(action.payload);
      state.presentedApiList.push(action.payload);

      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
    },
    search: (state: SliceState, action: any) => {
      const { delegableApiList } = state;
      const filterList = action.payload[1];
      const searchText = action.payload[0].trim().toLowerCase();
      const seachWords = searchText ? searchText.split(' ') : [];

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
      }

      const prioritizedApiList: DelegableApiWithPriority[] = [];
      if (searchText) {
        for (const api of searchPool) {
          let numMatches = 0;
          for (const word of seachWords) {
            if (
              api.name.toLowerCase().includes(word) ||
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

        console.log(prioritizedApiList);
        state.presentedApiList = prioritizedApiList
          .sort((a, b) => (a.priority < b.priority ? 1 : -1))
          .map(({ priority, ...otherAttr }) => otherAttr);
        console.log(state.presentedApiList);
      } else {
        state.presentedApiList = searchPool;
      }
    },
  },
});

export default delegableApiSlice.reducer;
export const { softAdd, softRemove, search } = delegableApiSlice.actions;
