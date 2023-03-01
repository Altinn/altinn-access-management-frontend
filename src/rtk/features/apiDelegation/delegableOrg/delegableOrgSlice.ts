import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
export interface DelegableOrg {
  id: string;
  orgName: string;
  orgNr: string;
}

export interface InitialState {
  delegableOrgsLoading: boolean;
  delegableOrgList: DelegableOrg[];
  presentedOrgList: DelegableOrg[];
  chosenDelegableOrgList: DelegableOrg[];
  error: string;
  searchOrgNonexistant?: boolean;
}

interface OrgDTO {
  orgNumber: string;
  unitType: string;
  name: string;
}

const initialState: InitialState = {
  delegableOrgsLoading: true,
  delegableOrgList: [],
  presentedOrgList: [],
  chosenDelegableOrgList: [],
  error: '',
};

export const lookupOrg = createAsyncThunk('delegableOrg/lookupOrg', async (orgNumber: string) => {
  return await axios
    // TODO: This may fail in AT if axios doesn't automatically change the base url
    .get(`/accessmanagement/api/v1/lookup/org/${orgNumber}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('error', error);
      throw error;
    });
});

const delegableOrgSlice = createSlice({
  name: 'delegableOrg',
  initialState,
  reducers: {
    softAddOrg: (state, action) => {
      const { delegableOrgList } = state;
      const { presentedOrgList } = state;
      state.delegableOrgList = delegableOrgList.filter((org) => org.id !== action.payload.id);
      state.presentedOrgList = presentedOrgList.filter((org) => org.id !== action.payload.id);

      state.chosenDelegableOrgList.push(action.payload);
    },
    softRemoveOrg: (state, action) => {
      state.delegableOrgList.push(action.payload);
      state.presentedOrgList.push(action.payload);

      const { chosenDelegableOrgList } = state;
      state.chosenDelegableOrgList = chosenDelegableOrgList.filter(
        (org) => org.id !== action.payload.id,
      );
    },
    searchInCurrentOrgs: (state, action) => {
      state.searchOrgNonexistant = false;
      const searchString: string = action.payload;
      const delegableOrgList = state.delegableOrgList;

      state.presentedOrgList = delegableOrgList.filter((org) =>
        org.orgNr.toString().includes(searchString),
      );
    },
    populateDelegableOrgs: (state, action) => {
      const orgList: DelegableOrg[] = action.payload;
      state.delegableOrgList = orgList;
      state.presentedOrgList = orgList;
      state.delegableOrgsLoading = false;
    },
    resetDelegableOrgs: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(lookupOrg.fulfilled, (state, action) => {
        const fetchedData: OrgDTO = action.payload;
        const org = {
          id: fetchedData.name,
          orgName: fetchedData.name,
          orgNr: fetchedData.orgNumber,
        };
        state.searchOrgNonexistant = false;
        if (state.chosenDelegableOrgList.filter((o) => o.id === org.id).length === 0) {
          state.presentedOrgList.push(org);
        }
      })
      .addCase(lookupOrg.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
        if (action.error.code === 'ERR_BAD_REQUEST') {
          state.searchOrgNonexistant = true;
        } else {
          state.searchOrgNonexistant = false;
        }
      });
  },
});

export default delegableOrgSlice.reducer;
export const {
  softAddOrg,
  softRemoveOrg,
  resetDelegableOrgs,
  searchInCurrentOrgs,
  populateDelegableOrgs,
} = delegableOrgSlice.actions;
