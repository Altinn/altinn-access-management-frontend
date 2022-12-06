import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DelegableApi {
  id: string;
  apiName: string;
  orgName: string;
  description: string;
}

export interface InitialState {
  loading: boolean;
  delegableApiList: DelegableApi[];
  chosenDelegableApiList: DelegableApi[];
  error: string;
}

const initialState: InitialState = {
  loading: false,
  delegableApiList: [
    {
      id: '1',
      apiName: 'API A',
      orgName: 'Skatteetaten',
      description: 'For å hente ut skatteklasser',
    },
    {
      id: '2',
      apiName: 'API B',
      orgName: 'Brønnøysundregistrene',
      description: 'For å hente ut skatt',
    },
  ],
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
    softAdd: (state, action) => {
      const { delegableApiList } = state;
      state.delegableApiList = delegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );

      state.chosenDelegableApiList.push(action.payload);
    },
    softRemove: (state, action) => {
      state.delegableApiList.push(action.payload);

      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
    },
  },
});

export default delegableApiSlice.reducer;
export const { softAdd, softRemove } = delegableApiSlice.actions;
