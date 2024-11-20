import { createSlice } from '@reduxjs/toolkit';

import { type Organization } from '../lookupApi';

export interface InitialState {
  chosenOrgs: Organization[];
}

const initialState: InitialState = {
  chosenOrgs: [],
};

const apiDelegationSlice = createSlice({
  name: 'apiDelegation',
  initialState,
  reducers: {
    addOrg: (state, action) => {
      state.chosenOrgs.push(action.payload);
    },
    removeOrg: (state, action) => {
      const { chosenOrgs } = state;
      state.chosenOrgs = chosenOrgs.filter((org) => org.orgNumber !== action.payload.orgNumber);
    },
    resetState: () => initialState,
  },
});

export default apiDelegationSlice.reducer;
export const { addOrg, removeOrg, resetState } = apiDelegationSlice.actions;
