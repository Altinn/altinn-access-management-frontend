import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type ResourceIdentifierDto } from '@/dataObjects/dtos/singleRights/ResourceIdentifierDto';
import type {
  IdValuePair,
  DelegationInputDto,
  DelegationRequestDto,
} from '@/dataObjects/dtos/singleRights/DelegationInputDto';
import { StatusResponse } from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { type ServiceResource } from './singleRightsApi';

export enum BFFDelegatedStatus {
  Delegated = 'Delegated',
  NotDelegated = 'NotDelegated',
}

export interface DelegationAccessCheckDto {
  resourceIdentifierDto: ResourceIdentifierDto;
  serviceResource: ServiceResource;
}

export interface DelegationResponseData {
  rightKey: string;
  resource: IdValuePair[];
  action: string;
  status: string;
  details: details;
}

interface details {
  code: string;
  description: string;
  parameters: parameters[];
}

interface parameters {
  roleRequirementsMatches: roleRequirementsMatches;
}

interface roleRequirementsMatches {
  name: string;
  value: string;
}

export interface ProcessedDelegation {
  meta: DelegationInputDto;
  bffResponseList?: DelegationResponseData[];
}

export interface ServiceWithStatus {
  rightDelegationResults?: DelegationResponseData[];
  service?: ServiceResource;
  status?: 'Delegable' | 'NotDelegable' | 'PartiallyDelegable';
  errorCode?: string;
}

interface sliceState {
  servicesWithStatus: ServiceWithStatus[];
  processedDelegations: ProcessedDelegation[];
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
  async (dto: DelegationInputDto) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error('Could not get AltinnPartyId cookie value');
    }

    return await axios
      .post(`/accessmanagement/api/v1/singleright/delegate/${altinnPartyId}`, dto)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
);

const createSerializedMeta = (meta: DelegationInputDto, status: StatusResponse) => {
  const To = [{ id: meta.To[0].id, value: meta.To[0].value }];

  const Rights = meta.Rights.map((right: DelegationRequestDto) => ({
    Resource: [{ id: right.Resource[0].id, value: right.Resource[0].value }],
    Action: right.Action,
  }));

  const serviceDto = {
    serviceTitle: meta.serviceDto.serviceTitle,
    serviceOwner: meta.serviceDto.serviceOwner,
  };

  return {
    To,
    Rights,
    serviceDto,
    status,
  };
};

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
          rightDelegationResults: action.payload,
          service: action.meta.arg.serviceResource,
          status: 'Delegable',
          errorCode: '',
        };

        const hasNonDelegableRights = !!action.payload.find(
          (response: DelegationResponseData) => response.status === 'NotDelegable',
        );

        if (hasNonDelegableRights) {
          const isDelegable = !!action.payload.find(
            (response: DelegationResponseData) => response.status === 'Delegable',
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
        const delegationInput = createSerializedMeta(action.meta.arg, StatusResponse.Fulfilled);

        const pushData: ProcessedDelegation = {
          meta: delegationInput,
          bffResponseList: action.payload.rightDelegationResults,
        };
        state.processedDelegations.push(pushData);
      })
      .addCase(delegate.rejected, (state, action) => {
        const delegationInput = createSerializedMeta(action.meta.arg, StatusResponse.Rejected);

        const pushData: ProcessedDelegation = {
          meta: delegationInput,
        };
        state.processedDelegations.push(pushData);
      });
  },
});

export default singleRightSlice.reducer;
export const { removeServiceResource, resetProcessedDelegations, resetServicesWithStatus } =
  singleRightSlice.actions;
