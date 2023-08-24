import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';

import { type ServiceResource } from './singleRightsApi';

export interface DelegationRequestDto {
  delegationRequest: ResourceIdentifierDto;
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
export interface ChosenService {
  accessCheckResponses?: delegationAccessCheckResponse[];
  service?: ServiceResource;
  status?: 'Delegable' | 'NotDelegable';
  errorCode?: string;
}

export interface ChosenServiceList {
  chosenServices: ChosenService[];
}

const initialState: ChosenServiceList = {
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
    removeServiceResource: (state: ChosenServiceList, action) => {
      state.chosenServices = state.chosenServices.filter(
        (s) => s.service?.identifier !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(delegationAccessCheck.fulfilled, (state, action) => {
      let chosenService: ChosenService = {};
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
