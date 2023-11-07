import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  IdValuePair,
  DelegationInputDto,
  DelegationRequestDto,
} from '@/dataObjects/dtos/singleRights/DelegationInputDto';

import { type ServiceResource } from './singleRightsApi';

export enum ReduxStatusResponse {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export enum BFFDelegatedStatus {
  Delegated = 'Delegated',
  NotDelegated = 'NotDelegated',
}

export enum ServiceStatus {
  Delegable = 'Delegable',
  NotDelegable = 'NotDelegable',
  PartiallyDelegable = 'PartiallyDelegable',
  Unchecked = 'Unchecked',
  Error = 'Error',
}

export interface DelegationAccessCheckDto {
  resourceReference: IdValuePair[];
  serviceResource: ServiceResource;
}

export interface DelegationResponseData {
  rightKey?: string;
  resource: IdValuePair[];
  action: string;
  status: string;
  details?: details;
  reduxStatus: ReduxStatusResponse;
}

export interface ProcessedDelegation {
  meta: DelegationInputDto;
  bffResponseList?: DelegationResponseData[];
}

export interface ServiceWithStatus {
  rightDelegationResults?: DelegationResponseData[];
  service?: ServiceResource;
  status?: ServiceStatus;
  errorCode?: string;
  isLoading?: boolean;
}

interface details {
  code?: string;
  description?: string;
  parameters?: parameters[];
}

interface parameters {
  roleRequirementsMatches: roleRequirementsMatches;
}

interface roleRequirementsMatches {
  name: string;
  value: string;
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
      .post(`/accessmanagement/api/v1/singleright/checkdelegationaccesses/${altinnPartyId}`, {
        resource: dto.resourceReference,
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        return rejectWithValue(error);
      });
  },
);

export const fetchRights = createAsyncThunk(
  'singleRightSlice/fetchRights',
  async (dto: DelegationAccessCheckDto, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');
    // TODO: Change to new fetchRights endpoint when available
    return await axios
      .post(`/accessmanagement/api/v1/singleright/checkdelegationaccesses/${altinnPartyId}`, {
        resource: dto.resourceReference,
      })
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

const createSerializedMeta = (meta: DelegationInputDto) => {
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
  };
};

const createDelegationResponseData = (
  resourceId: string,
  resourceValue: string,
  action: string,
  status: string,
  reduxStatus: ReduxStatusResponse,
  detailsCode?: string,
  detailsDescription?: string,
): DelegationResponseData => {
  return {
    resource: [{ id: resourceId, value: resourceValue }],
    action: action,
    status: status,
    details: {
      code: detailsCode,
      description: detailsDescription,
    },
    reduxStatus,
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
      .addCase(delegationAccessCheck.pending, (state, action) => {
        const serviceID = action.meta.arg.serviceResource.identifier;
        let nextServicesWithStatus;

        if (
          state.servicesWithStatus.some(
            (s: ServiceWithStatus) => s.service?.identifier === serviceID,
          )
        ) {
          nextServicesWithStatus = state.servicesWithStatus.map((sws: ServiceWithStatus) => {
            if (sws.service?.identifier === serviceID) {
              sws.isLoading = true;
            }
            return sws;
          });
        } else {
          const newServiceWithStatus: ServiceWithStatus = {
            service: action.meta.arg.serviceResource,
            isLoading: true,
          };
          nextServicesWithStatus = [...state.servicesWithStatus, newServiceWithStatus];
        }

        state.servicesWithStatus = nextServicesWithStatus;
      })

      .addCase(delegationAccessCheck.fulfilled, (state, action) => {
        const serviceID = action.meta.arg.serviceResource.identifier;
        let status = ServiceStatus.Delegable;
        let errorCode: string;

        const hasNonDelegableRights = !!action.payload.find(
          (response: DelegationResponseData) => response.status === ServiceStatus.NotDelegable,
        );

        if (hasNonDelegableRights) {
          const isDelegable = !!action.payload.find(
            (response: DelegationResponseData) => response.status === ServiceStatus.Delegable,
          );

          if (isDelegable) {
            status = ServiceStatus.PartiallyDelegable;
          } else {
            status = ServiceStatus.NotDelegable;
            errorCode = action.payload[0].details[0].code;
          }
        }
        const nextServicesWithStatus = state.servicesWithStatus.map((sws: ServiceWithStatus) => {
          if (sws.service?.identifier === serviceID) {
            sws.rightDelegationResults = action.payload;
            sws.isLoading = false;
            sws.status = status;
            sws.errorCode = errorCode;
          }
          return sws;
        });

        state.servicesWithStatus = nextServicesWithStatus;
      })

      .addCase(delegationAccessCheck.rejected, (state, action) => {
        const serviceID = action.meta.arg.serviceResource.identifier;
        const nextServicesWithStatus = state.servicesWithStatus.map((sws: ServiceWithStatus) => {
          if (sws.service?.identifier === serviceID) {
            sws.isLoading = false;
            sws.status = ServiceStatus.Error;
            sws.errorCode = 'HTTPError';
          }
          return sws;
        });
        state.servicesWithStatus = nextServicesWithStatus;
      })

      .addCase(fetchRights.fulfilled, (state, action) => {
        const serviceWithStatus: ServiceWithStatus = {
          rightDelegationResults: action.payload,
          service: action.meta.arg.serviceResource,
          status: ServiceStatus.Delegable,
          errorCode: '',
        };

        if (serviceWithStatus) {
          state.servicesWithStatus.push(serviceWithStatus);
        }
      })

      .addCase(delegate.fulfilled, (state, action) => {
        const delegationInput = createSerializedMeta(action.meta.arg);

        const bffResponseList: DelegationResponseData[] = action.payload.rightDelegationResults;
        bffResponseList.forEach(
          (data: DelegationResponseData) => (data.reduxStatus = ReduxStatusResponse.Fulfilled),
        );

        const pushData: ProcessedDelegation = {
          meta: delegationInput,
          bffResponseList,
        };
        state.processedDelegations.push(pushData);
      })

      .addCase(delegate.rejected, (state, action) => {
        const delegationInput = createSerializedMeta(action.meta.arg);

        const bffResponseList: DelegationResponseData[] = [];

        bffResponseList.push(
          createDelegationResponseData(
            delegationInput.Rights[0].Resource[0].id,
            delegationInput.Rights[0].Resource[0].value,
            delegationInput.Rights[0].Action,
            BFFDelegatedStatus.NotDelegated,
            ReduxStatusResponse.Rejected,
            action.error.code,
            action.error.message,
          ),
        );

        const pushData: ProcessedDelegation = {
          meta: delegationInput,
          bffResponseList,
        };
        state.processedDelegations.push(pushData);
      });
  },
});

export default singleRightSlice.reducer;
export const { removeServiceResource, resetProcessedDelegations, resetServicesWithStatus } =
  singleRightSlice.actions;
