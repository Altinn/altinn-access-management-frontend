import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface OverviewListItem {
  id: string;
  name: string;
  isSoftDelete: boolean;
}

export interface OverviewOrg {
  id: string;
  name: string;
  listItems: OverviewListItem[];
}

export interface InitialState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  softDeletedItems: OverviewOrg[];
  error: string;
}

const initialState: InitialState = {
  loading: false,
  overviewOrgs: [
    {
      id: '1',
      name: 'Evry',
      listItems: [
        { id: '1', name: 'Delegert API A', isSoftDelete: false },
        { id: '2', name: 'Delegert API B', isSoftDelete: false },
      ],
    },
    {
      id: '2',
      name: 'Skatteetaten',
      listItems: [
        { id: '1', name: 'Delegert API A', isSoftDelete: false },
        { id: '2', name: 'Delegert API B', isSoftDelete: false },
      ],
    },
  ],
  softDeletedItems: [],
  error: '',
};

export const fetchOverviewOrgs = createAsyncThunk('overviewOrg/fetchOverviewOrgs', async () => {
  return await axios
    .get('https://jsonplaceholder.typicode.com/users')
    .then((response) => response.data)
    .catch((error) => console.log(error));
});

const overviewOrgSlice = createSlice({
  name: 'overviewOrg',
  initialState,
  reducers: {
    softAdd: (state, action) => {
      state.overviewOrgs.push(action.payload);

      const { softDeletedItems: modifiedOverviewOrgs } = state;
      state.softDeletedItems = modifiedOverviewOrgs.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );
    },
    softDelete: (state, action) => {
      const { overviewOrgs } = state;
      state.overviewOrgs = overviewOrgs.filter(
        (delegableApi) => delegableApi.id !== action.payload.id,
      );

      state.softDeletedItems.push(action.payload);
    },
  },
});

export default overviewOrgSlice.reducer;
export const { softAdd, softDelete } = overviewOrgSlice.actions;
