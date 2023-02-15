import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { Action } from '@remix-run/router';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface ApiDelegation {
  orgName: string;
  apiName: string;
}

export interface SliceState {
  loading: boolean;
  error: string;
  succesfulApiDelegations: ApiDelegation[];
  failedApiDelegations: ApiDelegation[];
  batchPostSize: number;
  batchPostCounter: number;
}

export interface DelegationRequest {
  apiIdentifier: string;
  apiName: string;
  orgNr: string;
  orgName: string;
}

const initialState: SliceState = {
  loading: true,
  error: '',
  succesfulApiDelegations: [],
  failedApiDelegations: [],
  batchPostSize: 0,
  batchPostCounter: 0,
};

export const postApiDelegation = createAsyncThunk(
  'delegationRequestSlice/postApiDelegation',
  async (delegationInfo: DelegationRequest) => {
    const { apiIdentifier, apiName, orgNr, orgName }: DelegationRequest = delegationInfo;
    const delegation: ApiDelegation = {
      apiName,
      orgName,
    };
    const altinnPartyId =
      getCookie('AltinnPartyId') === null ? getCookie('AltinnPartyId') : '50067798';
    // TODO: Use orgNr instead of partyID
    return await axios
      .post(`/accessmanagement/api/v1/${altinnPartyId}/delegations/maskinportenschema`, {
        to: [
          {
            id: 'urn:altinn:organizationnumber',
            value: String(orgNr),
          },
        ],
        rights: [
          {
            resource: [
              {
                id: 'urn:altinn:resourceregistry',
                value: String(apiIdentifier),
              },
            ],
          },
        ],
      })
      .then((response) => {
        return delegation;
      })
      .catch((error) => {
        throw error;
      });
  },
);

const delegationRequestSlice = createSlice({
  name: 'delegationRequest',
  initialState,
  reducers: {
    resetDelegationRequests: () => initialState,
    setBatchPostSize: (state, action) => {
      state.batchPostSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDelegation.fulfilled, (state, action) => {
        const delegation: ApiDelegation = {
          apiName: action.payload.apiName,
          orgName: action.payload.orgName,
        };
        state.succesfulApiDelegations.push(delegation);
        state.batchPostCounter += 1;
        if (state.batchPostCounter === state.batchPostSize) {
          state.loading = false;
        }
      })
      .addCase(postApiDelegation.rejected, (state, action) => {
        const delegation: ApiDelegation = {
          apiName: action.meta.arg.apiName,
          orgName: action.meta.arg.orgName,
        };
        state.failedApiDelegations.push(delegation);
        state.batchPostCounter += 1;
        if (state.batchPostCounter === state.batchPostSize) {
          state.loading = false;
        }
      });
  },
});

export default delegationRequestSlice.reducer;
export const { resetDelegationRequests, setBatchPostSize } = delegationRequestSlice.actions;
