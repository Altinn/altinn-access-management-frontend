import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import { type DelegationInputDto } from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { type ServiceResource } from './singleRightsApi';

export interface DelegationAccessCheckDto {
  resourceIdentifierDto: ResourceIdentifierDto;
  serviceResource: ServiceResource;
}

interface delegationAccessCheckResponse {
  rightKey: string;
  resource: IdValuePair[];
  action: string;
  status: string;
  details: details;
}

export interface IdValuePair {
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
export interface ServiceWithStatus {
  accessCheckResponses?: delegationAccessCheckResponse[];
  service?: ServiceResource;
  status?: 'Delegable' | 'NotDelegable' | 'PartiallyDelegable';
  errorCode?: string;
}

interface sliceState {
  servicesWithStatus: ServiceWithStatus[];
  processedDelegations: DelegationInputDto[];
}

const initialState: sliceState = {
  servicesWithStatus: [],
  processedDelegations: [],
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

export const delegate = createAsyncThunk(
  'singleRights/delegate',
  async (dto: DelegationInputDto, { rejectWithValue }) => {
    try {
      const altinnPartyId = getCookie('AltinnPartyId');

      if (!altinnPartyId) {
        throw new Error('Could not get AltinnPartyId cookie value');
      }

      const response = await axios.post(
        `/accessmanagement/api/v1/singleright/delegate/${altinnPartyId}`,
        dto,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  },
);

const singleRightSlice = createSlice({
  name: 'singleRightsSlice',
  initialState,
  reducers: {
    removeServiceResource: (state: sliceState, action) => {
      state.servicesWithStatus = state.servicesWithStatus.filter(
        (s) => s.service?.identifier !== action.payload,
      );
    },
    resetProcessedDelegations: (state: sliceState) => {
      state.processedDelegations = initialState.processedDelegations;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(delegationAccessCheck.fulfilled, (state, action) => {
        const serviceWithStatus: ServiceWithStatus = {
          accessCheckResponses: action.payload,
          service: action.meta.arg.serviceResource,
          status: 'Delegable',
          errorCode: '',
        };

        const hasNonDelegableRights = !!action.payload.find(
          (response: delegationAccessCheckResponse) => response.status === 'NotDelegable',
        );

        if (hasNonDelegableRights) {
          const isDelegable = !!action.payload.find(
            (response: delegationAccessCheckResponse) => response.status === 'Delegable',
          );

          if (isDelegable) {
            serviceWithStatus.status = 'PartiallyDelegable';
          } else {
            serviceWithStatus.status = 'NotDelegable';
            serviceWithStatus.errorCode = action.payload[0].details[0].code;
          }
        }

        if (serviceWithStatus) {
          state.servicesWithStatus.push(serviceWithStatus);
        }
      })
      .addCase(delegate.fulfilled, (state, action) => {
        state.processedDelegations.push(action.meta.arg);
      })
      .addCase(delegate.rejected, (state, action) => {
        state.processedDelegations.push(action.meta.arg);
      });
  },
});

export default singleRightSlice.reducer;
export const { removeServiceResource, resetProcessedDelegations } = singleRightSlice.actions;
