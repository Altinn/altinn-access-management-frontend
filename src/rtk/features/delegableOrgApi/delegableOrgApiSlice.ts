import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DelegableOrgApi {
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
  delegableOrgApiList: DelegableOrgApi[];
  presentedOrgApiList: DelegableOrgApi[];
  chosenDelegableOrgApiList: DelegableOrgApi[];
  searchProps: SearchProps;
  error: string;
}

const initialState: InitialState = {
  loading: false,
  delegableOrgApiList: [
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
  presentedOrgApiList: [
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
  chosenDelegableOrgApiList: [],
  error: '',
};

export const fetchDelegableOrgApis = createAsyncThunk('delegableOrgApi/fetchDelegableOrgApis', async () => {
  return await axios
    .get('https://jsonplaceholder.typicode.com/users')
    .then((response) => response.data)
    .catch((error) => console.log(error));
});

const delegableOrgApiSlice = createSlice({
  name: 'delegableOrgApi',
  initialState,
  reducers: {
    softAdd: (state, action) => {
      const { delegableOrgApiList } = state;
      const { presentedOrgApiList } = state;
      state.delegableOrgApiList = delegableOrgApiList.filter((orgApi) => orgApi.id !== action.payload.id);
      state.presentedOrgApiList = presentedOrgApiList.filter((orgApi) => orgApi.id !== action.payload.id);

      state.chosenDelegableOrgApiList.push(action.payload);
    },
    softRemove: (state, action) => {
      state.delegableOrgApiList.push(action.payload);
      state.presentedOrgApiList.push(action.payload);

      const { chosenDelegableOrgApiList } = state;
      state.chosenDelegableOrgApiList = chosenDelegableOrgApiList.filter((orgApi) => orgApi.id !== action.payload.id);
    },
    search: (state, action) => {
      const { delegableOrgApiList } = state;
      state.presentedOrgApiList = delegableOrgApiList.filter(
        (orgApi) =>
          orgApi.name.includes(action.payload) ||
          orgApi.description.includes(action.payload) ||
          orgApi.orgName.includes(action.payload),
      );
    },
  },
});

export default delegableOrgApiSlice.reducer;
export const { softAdd, softRemove, search } = delegableOrgApiSlice.actions;
