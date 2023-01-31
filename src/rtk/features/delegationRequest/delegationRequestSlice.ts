import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import type { DelegableApi } from '../delegableApi/delegableApiSlice';
import type { DelegableOrg } from '../delegableOrg/delegableOrgSlice';

export interface ApiDelegation {
  orgName: string;
  apiName: string;
}

export interface InitialState {
  loading: boolean;
  error: string;
  succesfulApiDelegations: ApiDelegation[];
  failedApiDelegations: ApiDelegation[];
}

export interface DelegationRequest {
  apiIdentifier: string;
  orgNr: string;
}

const initialState: InitialState = {
  loading: true,
  error: '',
  succesfulApiDelegations: [
    {
      orgName: 'Org blabla',
      apiName: 'Api blabla',
    },
  ],
  failedApiDelegations: [
    {
      orgName: 'Org blabla',
      apiName: 'Api blabla',
    },
  ],
};

export const delegateApi = async (
  state: InitialState,
  apiList: DelegableApi[],
  orgList: DelegableOrg[],
) => {
  for (let i = 0; i < apiList.length; i++) {
    for (let j = 0; j < orgList.length; j++) {
      const delegationRequest = {
        apiIdentifier: apiList[i].id,
        orgNr: orgList[j].orgNr,
      };

      const apiDelegation = {
        apiName: apiList[i].apiName,
        orgName: orgList[j].orgName,
      };
      try {
        await postApiDelegation(delegationRequest);
        state.succesfulApiDelegations.push(apiDelegation);
      } catch {
        state.failedApiDelegations.push(apiDelegation);
      }
    }
  }
};

const postApiDelegation = createAsyncThunk(
  'delegationRequestSlice/delegateApi',
  async ({ apiIdentifier, orgNr }: DelegationRequest) => {
    return await axios
      .get('/accessmanagement/api/v1/1337/resources/maskinportenschema')
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
  },
);

const delegationRequestSlice = createSlice({
  name: 'delegationRequest',
  initialState,
  reducers: {},
});

export default delegationRequestSlice.reducer;
// export const {} = delegationRequestSlice.actions;
