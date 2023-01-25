import { createSlice } from '@reduxjs/toolkit';
export interface DelegableOrg {
  id: string;
  orgName: string;
  orgNr: string;
  description: string;
}

export interface InitialState {
  loading: boolean;
  delegableOrgList: DelegableOrg[];
  chosenDelegableOrgList: DelegableOrg[];
  error: string;
}

const initialState: InitialState = {
  loading: false,
  delegableOrgList: [],
  chosenDelegableOrgList: [],
  error: '',
};

const delegableOrgSlice = createSlice({
  name: 'delegableOrg',
  initialState,
  reducers: {
    softAddOrg: (state, action) => {
      const { delegableOrgList } = state;
      state.delegableOrgList = delegableOrgList.filter(
        (delegableOrg) => delegableOrg.id !== action.payload.id,
      );

      state.chosenDelegableOrgList.push(action.payload);
    },
    softRemoveOrg: (state, action) => {
      state.delegableOrgList.push(action.payload);

      const { chosenDelegableOrgList } = state;
      state.chosenDelegableOrgList = chosenDelegableOrgList.filter(
        (delegableOrg) => delegableOrg.id !== action.payload.id,
      );
    },
    populateDelegableOrgs: (state, action) => {
      const orgList: DelegableOrg[] = action.payload;
      state.delegableOrgList = orgList;
    },
    resetChosenOrgs: (state, action) => {
      state.chosenDelegableOrgList = [];
    },
  },
});

export default delegableOrgSlice.reducer;
export const { softAddOrg, softRemoveOrg, resetChosenOrgs, populateDelegableOrgs } =
  delegableOrgSlice.actions;
