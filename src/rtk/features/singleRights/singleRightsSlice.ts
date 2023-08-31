import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';

import { type ServiceResource } from './singleRightsApi';

export interface DelegationAccessCheckDto {
  resourceIdentifierDto: ResourceIdentifierDto;
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
  status?: 'Delegable' | 'NotDelegable' | 'PartiallyDelegable';
  errorCode?: string;
}

interface chosenServiceList {
  chosenServices: ChosenService[];
}

const initialState: chosenServiceList = {
  chosenServices: [],
};

export const delegationAccessCheck = createAsyncThunk(
  'singleRightSlice/delegationAccessCheck',
  async (dto: DelegationAccessCheckDto, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    return await axios
      .post(
        `/accessmanagement/api/v1/singleright/checkdelegationaccesses/${altinnPartyId}`,
        dto.resourceIdentifierDto,
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
    removeServiceResource: (state: chosenServiceList, action) => {
      state.chosenServices = state.chosenServices.filter(
        (s) => s.service?.identifier !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(delegationAccessCheck.fulfilled, (state, action) => {
      const chosenService: ChosenService = {
        accessCheckResponses: action.payload,
        service: action.meta.arg.serviceResource,
        status: 'Delegable',
        errorCode: '',
      };

      const isNotDelegable = action.payload.find(
        (response: delegationAccessCheckResponse) => response.status === 'NotDelegable',
      );

      if (isNotDelegable) {
        const isDelegable = action.payload.find(
          (response: delegationAccessCheckResponse) => response.status === 'Delegable',
        );

        if (isDelegable) {
          chosenService.status = 'PartiallyDelegable';
          chosenService.errorCode = action.payload.find(
            (resp: delegationAccessCheckResponse) => resp.status === 'NotDelegable',
          ).details[0].code;
        } else {
          chosenService.status = 'NotDelegable';
          chosenService.errorCode = action.payload[0].details[0].code;
        }
      }

      if (chosenService) {
        state.chosenServices.push(chosenService);
      }
    });
  },
});

export default singleRightSlice.reducer;
export const { removeServiceResource } = singleRightSlice.actions;
