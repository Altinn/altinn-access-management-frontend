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
  delegableOrgList: [
    {
      id: '1',
      orgName: 'Evry',
      orgNr: '930124123',
      description: 'For å hente ut skatteklasser',
    },
    {
      id: '2',
      orgName: 'Accenture',
      orgNr: '950124321',
      description: 'For å hente ut skatt',
    },
  ],
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
    resetDelegableOrgs: () => initialState,
  },
});

export default delegableOrgSlice.reducer;
export const { softAddOrg, softRemoveOrg, resetDelegableOrgs } = delegableOrgSlice.actions;
