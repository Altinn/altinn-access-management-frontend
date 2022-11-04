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
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
    {
      id: '2',
      name: 'API B',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatt',
    },
  ],
  chosenDelegableOrgApiList: [],
  error: '',
};

export const fetchDelegableOrgApis = createAsyncThunk(
  'delegableOrgApi/fetchDelegableOrgApis',
  async () => {
    return await axios
      .get('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.data)
      .catch((error) => console.log(error));
  },
);

const delegableOrgApiSlice = createSlice({
  name: 'delegableOrgApi',
  initialState,
  reducers: {
    softAdd: (state, action) => {
      const { delegableOrgApiList } = state;
      state.delegableOrgApiList = delegableOrgApiList.filter(
        (orgApi) => orgApi.id !== action.payload.id,
      );

      state.chosenDelegableOrgApiList.push(action.payload);
    },
    softRemove: (state, action) => {
      state.delegableOrgApiList.push(action.payload);

      const { chosenDelegableOrgApiList } = state;
      state.chosenDelegableOrgApiList = chosenDelegableOrgApiList.filter(
        (orgApi) => orgApi.id !== action.payload.id,
      );
    },
    search: (state, action) => {
      const { delegableOrgApiList } = state;
      state.delegableOrgApiList = delegableOrgApiList.filter(
        (orgApi) => orgApi.name !== action.payload,
      );
    },
  },
});

export default delegableOrgApiSlice.reducer;
export const { softAdd, softRemove, search } = delegableOrgApiSlice.actions;
