import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import type {
  IdValuePair,
  type DelegationInputDto,
} from '@/dataObjects/dtos/singleRights/DelegationInputDto';

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
    resetServicesWithStatus: (state: sliceState) => {
      state.servicesWithStatus = initialState.servicesWithStatus;
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
        console.log('action.meta.arg', action.meta.arg);

        const delegationInput: DelegationInputDto = {
          To: [{ id: action.meta.arg.To[0].id, value: action.meta.arg.To[0].value }],
          Rights: action.meta.arg.Rights.map((right) => ({
            Resource: [{ id: right.Resource[0].id, value: right.Resource[0].value }],
            Action: right.Action,
          })),
          ServiceDto: {
            serviceTitle: action.meta.arg.ServiceDto.serviceTitle,
            serviceOwner: action.meta.arg.ServiceDto.serviceOwner,
          },
        };
        state.processedDelegations.push(delegationInput);
      })
      .addCase(delegate.rejected, (state, action) => {
        //state.processedDelegations.push(action.meta.arg);
      });
  },
});

export default singleRightSlice.reducer;
export const { removeServiceResource, resetProcessedDelegations, resetServicesWithStatus } =
  singleRightSlice.actions;
