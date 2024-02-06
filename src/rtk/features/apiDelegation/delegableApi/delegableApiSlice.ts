import { createSlice } from '@reduxjs/toolkit';

import { type CustomError } from '@/dataObjects';
import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';

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
  loading: boolean;
  chosenDelegableApiList: DelegableApi[];
  apiProviders: string[];
  error: CustomError;
}

const initialState: SliceState = {
  loading: true,
  apiProviders: [''],
  chosenDelegableApiList: [],
  error: {
    message: '',
    statusCode: '',
  },
};

const delegableApiSlice = createSlice({
  name: 'delegableApi',
  initialState,
  reducers: {
    softAddApi: (state: SliceState, action) => {
      state.chosenDelegableApiList.push(action.payload);
    },
    softRemoveApi: (state: SliceState, action) => {
      const { chosenDelegableApiList } = state;
      state.chosenDelegableApiList = chosenDelegableApiList.filter(
        (delegableApi) => delegableApi.identifier !== action.payload.identifier,
      );
    },
  },
});

export default delegableApiSlice.reducer;
export const { softAddApi, softRemoveApi } = delegableApiSlice.actions;
