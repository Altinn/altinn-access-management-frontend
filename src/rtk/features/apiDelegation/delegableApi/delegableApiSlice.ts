import { createSlice } from '@reduxjs/toolkit';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';

export interface ApiDelegation {
  orgName: string;
  apiName: string;
}

export interface DelegableApi {
  identifier: string;
  apiName: string;
  orgName: string;
  rightDescription: string;
  description?: string;
  scopes: string[];
  isLoading: boolean;
  errorCode: string | undefined;
  authorizationReference: IdValuePair[];
}

export interface SliceState {
  chosenApis: DelegableApi[];
}

const initialState: SliceState = {
  chosenApis: [],
};

const delegableApiSlice = createSlice({
  name: 'delegableApi',
  initialState,
  reducers: {
    softAddApi: (state: SliceState, action) => {
      state.chosenApis.push(action.payload);
    },
    softRemoveApi: (state: SliceState, action) => {
      const { chosenApis: chosenDelegableApiList } = state;
      state.chosenApis = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.identifier !== action.payload.identifier,
      );
    },
    resetChosenApis: () => initialState,
  },
});

export default delegableApiSlice.reducer;
export const { softAddApi, softRemoveApi, resetChosenApis } = delegableApiSlice.actions;
