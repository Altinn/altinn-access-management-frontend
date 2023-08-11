import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { type DelegationRequest } from '@/dataObjects/dtos/CheckDelegationAccessDto';

import { type ServiceResource } from './singleRightsApi';

export interface DelegationRequestDto {
  delegationRequest: DelegationRequest;
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
  info: string;
  detailParams: DetailParams[];
}

interface DetailParams {
  name: string;
  value: string;
}

interface ChosenService {
  accessCheckResponses?: DelegationAccessCheckResponse[];
  service?: ServiceResource;
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
    console.log('fetchObj', dto);
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

/* action.payload.some((DelegationAccessCheckResponse) => {
        dacr.some((response: DelegationAccessCheckResponse[]) => {
          response.status === 'Delegable'
        }),
      }); */

const singleRightSlice = createSlice({
  name: 'singleRightsSlice',
  initialState,
  reducers: {
    softAddService: (state, action) => {
      for (const chosenService of state.chosenServices) {
        if (chosenService.service?.identifier === action.payload.identifier) {
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(delegationAccessCheck.fulfilled, (state, action) => {
      let chosenService: ChosenService = {};
      action.payload.some((dacr: DelegationAccessCheckResponse) => {
        if (dacr.status === 'Delegable') {
          chosenService = {
            accessCheckResponses: action.payload,
            service: action.meta.arg.serviceResource,
          };
        }
      });

      if (chosenService) {
        state.chosenServices.push(chosenService);
      }
    });
  },
});

export default singleRightSlice.reducer;
