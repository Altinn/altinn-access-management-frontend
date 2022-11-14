import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface OverviewListItem {
  id: string;
  name: string;
  isSoftDelete: boolean;
}

export interface OverviewOrg {
  id: string;
  name: string;
  isAllSoftDeleted: boolean;
  listItems: OverviewListItem[];
}

export interface InitialState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  softDeletedOrgsItems: OverviewOrg[];
  error: string;
}

const initialState: InitialState = {
  loading: false,
  overviewOrgs: [
    {
      id: '1',
      name: 'Evry',
      isAllSoftDeleted: false,
      listItems: [
        { id: '1', name: 'Delegert API A', isSoftDelete: false },
        { id: '2', name: 'Delegert API B', isSoftDelete: false },
      ],
    },
    {
      id: '2',
      name: 'Skatteetaten',
      isAllSoftDeleted: false,
      listItems: [
        { id: '1', name: 'Delegert API A', isSoftDelete: false },
        { id: '2', name: 'Delegert API B', isSoftDelete: false },
      ],
    },
  ],
  softDeletedOrgsItems: [],
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
    toggleSoftDelete: (state, action) => {
      let softDeleteCount = 0;
      let orgExists = false;
      for (const org of state.softDeletedOrgsItems) {
        if (org.id === action.payload[0].id) {
          org.listItems.push(action.payload[1]);
          orgExists = true;
        }
      }
      for (const org of state.overviewOrgs) {
        if (org.id === action.payload[0].id) {
          const copyOrg: OverviewOrg = {
            id: org.id,
            name: org.name,
            isAllSoftDeleted: false,
            listItems: [],
          };
          for (const item of org.listItems) {
            if (item.isSoftDelete) {
              softDeleteCount++;
            }
            if (item.id === action.payload[1].id) {
              item.isSoftDelete = true;
              softDeleteCount++;
              if (!orgExists) {
                copyOrg.listItems.push(item);
                state.softDeletedOrgsItems.push(copyOrg);
              }
            }
            if (softDeleteCount === org.listItems.length) {
              org.isAllSoftDeleted = true;
            }
            if (softDeleteCount < org.listItems.length) {
              org.isAllSoftDeleted = false;
            }
          }
        }
      }
    },
    softAdd: (state, action) => {
      for (const org of state.softDeletedOrgsItems) {
        if (org.id === action.payload[0].id) {
          org.listItems = org.listItems.filter((item) => item.id !== action.payload[1].id);
        }
        if (org.listItems.length === 0) {
          const { softDeletedOrgsItems } = state;
          state.softDeletedOrgsItems = softDeletedOrgsItems.filter(
            (org) => org.id !== action.payload[0].id,
          );
        }
      }

      for (const org of state.overviewOrgs) {
        if (org.id === action.payload[0].id) {
          for (const item of org.listItems) {
            if (item.id === action.payload[1].id) {
              item.isSoftDelete = false;
            }
            org.isAllSoftDeleted = false;
          }
        }
      }
    },
    save: (state) => {
      const filteredOrgs: OverviewOrg[] = [];
      for (const org of state.overviewOrgs) {
        const updateOrg: OverviewOrg = {
          id: org.id,
          name: org.name,
          isAllSoftDeleted: org.isAllSoftDeleted,
          listItems: org.listItems.filter((item) => !item.isSoftDelete),
        };
        filteredOrgs.push(updateOrg);
      }
      state.softDeletedOrgsItems = filteredOrgs.filter((org) => org.listItems.length === 0);
    },
  },
});

export default overviewOrgSlice.reducer;
export const { toggleSoftDelete, softAdd, save } = overviewOrgSlice.actions;
