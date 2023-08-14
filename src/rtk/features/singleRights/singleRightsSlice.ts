import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { type ResourceList } from '@/dataObjects/dtos/singleRights/ResourceList';

import { type ServiceResource } from './singleRightsApi';

export interface DelegationRequestDto {
  delegationRequest: ResourceList;
  serviceResource: ServiceResource;
}

export interface DelegationAccessCheckResponse {
  rightKey: string;
  resource: IdValuePair[];
  action: string;
  status: string;
  details: Details;
}

interface IdValuePair {
  id: string;
  value: string;
}

interface Details {
  detailCode: string;
  description: string;
  detailParams: DetailParams[];
}

interface DetailParams {
  name: string;
  value: string;
}

export interface ChosenService {
  accessCheckResponses?: DelegationAccessCheckResponse[];
  service?: ServiceResource;
  status?: 'Delegable' | 'NotDelegable';
  notDelegableDetails?: string;
}

export interface ChosenServices {
  chosenServices: ChosenService[];
}

const initialState: ChosenServices = {
  chosenServices: [],
};

export const delegationAccessCheck = createAsyncThunk(
  'singleRightSlice/delegationAccessCheck',
  async (dto: DelegationRequestDto, { rejectWithValue }) => {
    return await axios
      .post(
        `/accessmanagement/api/v1/singleright/checkdelegationaccesses/${1232131234}`,
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
    removeServiceResource: (state: ChosenServices, action) => {
      state.chosenServices = state.chosenServices.filter(
        (s) => s.service?.identifier !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(delegationAccessCheck.fulfilled, (state, action) => {
      let chosenService: ChosenService = {};
      const delegableService = action.payload.find(
        (response: DelegationAccessCheckResponse) => response.status === 'Delegable',
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
          notDelegableDetails: action.payload[0].details[0].description,
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
