import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { type ResourceList } from '@/dataObjects/dtos/singleRights/ResourceList';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { type ServiceResource } from './singleRightsApi';

export interface DelegationRequestDto {
  delegationRequest: ResourceList;
  serviceResource: ServiceResource;
}

interface delegationAccessCheckResponse {
  rightKey: string;
  resource: idValuePair[];
  action: string;
  status: string;
  details: details;
}

interface idValuePair {
  id: string;
  value: string;
}

interface details {
  code: string;
  description: string;
  detailParams: detailParams[];
}

interface detailParams {
  name: string;
  value: string;
}

interface chosenService {
  accessCheckResponses?: delegationAccessCheckResponse[];
  service?: ServiceResource;
  status?: 'Delegable' | 'NotDelegable';
  errorCode?: string;
}

interface chosenServices {
  chosenServices: chosenService[];
}

const initialState: chosenServices = {
  chosenServices: [],
};

export const delegationAccessCheck = createAsyncThunk(
  'singleRightSlice/delegationAccessCheck',
  async (dto: DelegationRequestDto, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    return await axios
      .post(
        `/accessmanagement/api/v1/singleright/checkdelegationaccesses/${altinnPartyId}`,
        dto.delegationRequest,
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        return rejectWithValue(error);
      });
  },
);

const singleRightSlice = createSlice({
  name: 'singleRightsSlice',
  initialState,
  reducers: {
    removeServiceResource: (state: chosenServices, action) => {
      state.chosenServices = state.chosenServices.filter(
        (s) => s.service?.identifier !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(delegationAccessCheck.fulfilled, (state, action) => {
      let chosenService: chosenService = {};
      const delegableService = action.payload.find(
        (response: delegationAccessCheckResponse) => response.status === 'Delegable',
      );
      if (delegableService) {
        chosenService = {
          accessCheckResponses: action.payload,
          service: action.meta.arg.serviceResource,
          status: 'Delegable',
        };
      } else {
        chosenService = {
          accessCheckResponses: action.payload,
          service: action.meta.arg.serviceResource,
          status: 'NotDelegable',
          errorCode: action.payload[0].details[0].code,
        };
      }
      if (chosenService) {
        state.chosenServices.push(chosenService);
      }
    });
  },
});

export default singleRightSlice.reducer;
export const { removeServiceResource } = singleRightSlice.actions;
