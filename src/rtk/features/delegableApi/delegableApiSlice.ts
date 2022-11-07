import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DelegableApi {
  id: string;
  name: string;
  orgName: string;
  description: string;
}

export interface SearchProps {
  id: boolean;
  name: boolean;
  orgName: boolean;
  description: boolean;
}

interface InitialState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  presentedApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  search: SearchProps;
  error: string;
}

const initialState: InitialState = {
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
      orgName: 'Bamas',
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
      orgName: 'Bamas',
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
    softAdd: (state, action) => {
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
    softRemove: (state, action) => {
      state.delegableApiList.push(action.payload);
      state.presentedApiList.push(action.payload);

      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
    },
    search: (state, action) => {
      const { delegableApiList } = state;
      state.presentedApiList = delegableApiList.filter(
        (delegableApi) =>
          delegableApi.name.includes(action.payload) ||
          delegableApi.description.includes(action.payload) ||
          delegableApi.orgName.includes(action.payload),
      );
    },
  },
});

export default delegableApiSlice.reducer;
export const { softAdd, softRemove, search } = delegableApiSlice.actions;
