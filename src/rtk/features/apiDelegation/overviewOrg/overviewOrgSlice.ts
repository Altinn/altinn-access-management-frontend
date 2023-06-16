/* eslint-disable @typescript-eslint/restrict-plus-operands */
import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { LayoutState } from '@/features/apiDelegation/components/LayoutState';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { type CustomError } from '@/dataObjects';

export interface ApiListItem {
  id: string;
  apiName: string;
  isSoftDelete: boolean;
  owner: string;
  description: string;
  scopes: string[];
}

export interface OverviewOrg {
  id: string;
  orgName: string;
  orgNr: string;
  isAllSoftDeleted: boolean;
  apiList: ApiListItem[];
}

interface ResourceReference {
  reference: string;
  referenceSource: string;
  referenceType: string;
}
interface DelegationDTO {
  coveredByName: string;
  offeredByName: string;
  offeredByOrganizationNumber: string;
  coveredByOrganizationNumber: string;
  resourceId: string;
  resourceTitle: string;
  resourceOwnerName: string;
  rightDescription: string;
  resourceReferences: ResourceReference[];
}

export interface SliceState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  error: CustomError;
}

export interface DeletionRequest {
  orgNr: string;
  apiId: string;
}

const initialState: SliceState = {
  loading: true,
  overviewOrgs: [],
  error: {
    message: '',
    statusCode: '',
  },
};

const mapToOverviewOrgList = (delegationArray: DelegationDTO[], layout: LayoutState) => {
  const overviewOrgList: OverviewOrg[] = [];
  for (const delegation of delegationArray) {
    const api: ApiListItem = {
      id: delegation.resourceId,
      apiName: delegation.resourceTitle,
      isSoftDelete: false,
      owner: delegation.resourceOwnerName,
      description: delegation.rightDescription,
      scopes: [],
    };
    for (const ref of delegation.resourceReferences) {
      if (ref.referenceType === 'MaskinportenScope') {
        api.scopes.push(ref.reference);
      }
    }

    let delegationOrg = '';
    let delegationOrgNumber = '';
    switch (layout) {
      case LayoutState.Offered:
        delegationOrg = delegation.coveredByName;
        delegationOrgNumber = delegation.coveredByOrganizationNumber;
        break;
      case LayoutState.Received:
        delegationOrg = delegation.offeredByName;
        delegationOrgNumber = delegation.offeredByOrganizationNumber;
        break;
    }

    const existingOrgIndex = overviewOrgList.findIndex((org) => org.id === delegationOrg);
    if (existingOrgIndex >= 0) {
      // Add delegation to existing org-entry
      overviewOrgList[existingOrgIndex].apiList.push(api);
    } else {
      // Add new org
      const newOrg: OverviewOrg = {
        id: delegationOrg,
        orgName: delegationOrg,
        orgNr: delegationOrgNumber,
        isAllSoftDeleted: false,
        apiList: [api],
      };
      overviewOrgList.push(newOrg);
    }
  }

  return overviewOrgList;
};

const setAllSoftDeleteState = (
  state: SliceState,
  softDeletedOrgId: string,
  isSoftDelete: boolean,
) => {
  for (const org of state.overviewOrgs) {
    if (org.id === softDeletedOrgId) {
      for (const item of org.apiList) {
        item.isSoftDelete = isSoftDelete;
      }
      org.isAllSoftDeleted = isSoftDelete;
      break;
    }
  }
};

const createCopyOrg = (org: OverviewOrg) => {
  return {
    id: org.id,
    orgName: org.orgName,
    isAllSoftDeleted: false,
    orgNr: org.orgNr,
    apiList: [],
  };
};

export const fetchOverviewOrgsOffered = createAsyncThunk(
  'overviewOrg/fetchOverviewOrgsOffered',
  async (_, { rejectWithValue }) => {
    try {
      const altinnPartyId = getCookie('AltinnPartyId');

      if (!altinnPartyId) {
        throw new Error(String('Could not get AltinnPartyId cookie value'));
      }

      const response = await axios.get(
        `/accessmanagement/api/v1/${altinnPartyId}/maskinportenschema/offered`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  },
);

export const fetchOverviewOrgsReceived = createAsyncThunk(
  'overviewOrg/fetchOverviewOrgsReceived',
  async (_, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }

    return await axios
      .get(`/accessmanagement/api/v1/${altinnPartyId}/maskinportenschema/received`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        return rejectWithValue(error);
      });
  },
);

export const deleteOfferedApiDelegation = createAsyncThunk(
  'overviewOrg/deleteOfferedApiDelegation',
  async (request: DeletionRequest, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }

    try {
      const response = await axios.post(
        `/accessmanagement/api/v1/${altinnPartyId}/maskinportenschema/offered/revoke`,
        {
          to: [
            {
              id: 'urn:altinn:organizationnumber',
              value: String(request.orgNr),
            },
          ],
          rights: [
            {
              resource: [
                {
                  id: 'urn:altinn:resource',
                  value: request.apiId,
                },
              ],
            },
          ],
        },
      );

      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  },
);

export const deleteReceivedApiDelegation = createAsyncThunk(
  'overviewOrg/deleteReceivedApiDelegation',
  async (request: DeletionRequest, { rejectWithValue }) => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }

    return await axios
      .post(`/accessmanagement/api/v1/${altinnPartyId}/maskinportenschema/received/revoke`, {
        from: [
          {
            id: 'urn:altinn:organizationnumber',
            value: String(request.orgNr),
          },
        ],
        rights: [
          {
            resource: [
              {
                id: 'urn:altinn:resource',
                value: request.apiId,
              },
            ],
          },
        ],
      })
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        return rejectWithValue(error);
      });
  },
);

const overviewOrgSlice = createSlice({
  name: 'overviewOrg',
  initialState,
  reducers: {
    softDelete: (state, action) => {
      let softDeleteCount = 0;
      const softDeletedItemId = action.payload[1];
      const softDeletedOrgId = action.payload[0];

      for (const org of state.overviewOrgs) {
        if (org.id === softDeletedOrgId) {
          const copyOrg: OverviewOrg = createCopyOrg(org);

          for (const item of org.apiList) {
            if (item.isSoftDelete) {
              softDeleteCount++;
            }
            if (item.id === softDeletedItemId) {
              item.isSoftDelete = true;
              softDeleteCount++;
              copyOrg.apiList.push(item);
            }
          }
          if (softDeleteCount === org.apiList.length) {
            org.isAllSoftDeleted = true;
          }
          if (softDeleteCount < org.apiList.length) {
            org.isAllSoftDeleted = false;
          }
        }
      }
    },
    softRestore: (state, action) => {
      const selectedOrgId = action.payload[0];
      const restoredListItemId = action.payload[1];

      for (const org of state.overviewOrgs) {
        if (org.id === selectedOrgId) {
          for (const item of org.apiList) {
            if (item.id === restoredListItemId) {
              item.isSoftDelete = false;
            }
          }
          org.isAllSoftDeleted = false;
          break;
        }
      }
    },
    softRestoreAll: (state, action) => {
      const restoredOrgId = action.payload;

      setAllSoftDeleteState(state, restoredOrgId, false);
    },
    softDeleteAll: (state, action) => {
      const selectedOrgId = action.payload;

      setAllSoftDeleteState(state, selectedOrgId, true);
    },
    restoreAllSoftDeletedItems: (state) => {
      for (const org of state.overviewOrgs) {
        for (const item of org.apiList) {
          item.isSoftDelete = false;
        }
        org.isAllSoftDeleted = false;
      }
    },
    setLoading: (state) => {
      state.loading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewOrgsReceived.fulfilled, (state, action) => {
        state.loading = true;
        const dataArray = action.payload;
        const responseList: OverviewOrg[] = mapToOverviewOrgList(dataArray, LayoutState.Received);
        state.overviewOrgs = responseList;
        state.loading = false;
      })
      .addCase(fetchOverviewOrgsReceived.rejected, (state, action) => {
        state.loading = true;
        state.error.statusCode = String(action.payload?.response?.status) ?? 'Unknown code';
        if (state.error.statusCode === '400') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else if (state.error.statusCode === '500') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else {
          state.error.message = 'Unknown error';
        }
        state.loading = false;
      })
      .addCase(fetchOverviewOrgsOffered.fulfilled, (state, action) => {
        state.loading = true;
        const dataArray = action.payload;
        const responseList: OverviewOrg[] = mapToOverviewOrgList(dataArray, LayoutState.Offered);
        state.overviewOrgs = responseList;
        state.loading = false;
      })
      .addCase(fetchOverviewOrgsOffered.rejected, (state, action) => {
        state.loading = true;
        state.error.statusCode = String(action.payload?.response?.status) ?? 'Unknown code';
        if (state.error?.statusCode === '400') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else if (state.error?.statusCode === '500') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else {
          state.error.message = 'Unknown error';
        }
        state.loading = false;
      })
      .addCase(deleteOfferedApiDelegation.fulfilled, (state, action) => {
        const { overviewOrgs } = state;
        for (const org of overviewOrgs) {
          if (org.orgNr === action.meta.arg.orgNr) {
            org.apiList = org.apiList.filter((api) => api.id !== action.meta.arg.apiId);
          }
        }
        state.overviewOrgs = overviewOrgs.filter((org) => org.apiList.length !== 0);
      })
      .addCase(deleteOfferedApiDelegation.rejected, (state, action) => {
        state.error.statusCode = String(action.payload?.response?.status) ?? 'Unknown code';
        if (state.error?.statusCode === '400') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else if (state.error?.statusCode === '500') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else {
          state.error.message = 'Unknown error';
        }
      })
      .addCase(deleteReceivedApiDelegation.fulfilled, (state, action) => {
        const { overviewOrgs } = state;
        for (const org of overviewOrgs) {
          if (org.orgNr === action.meta.arg.orgNr) {
            org.apiList = org.apiList.filter((api) => api.id !== action.meta.arg.apiId);
          }
        }
        state.overviewOrgs = overviewOrgs.filter((org) => org.apiList.length !== 0);
      })
      .addCase(deleteReceivedApiDelegation.rejected, (state, action) => {
        state.error.statusCode = String(action.payload?.response?.status) ?? 'Unknown code';
        if (state.error?.statusCode === '400') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else if (state.error?.statusCode === '500') {
          state.error.message = action.payload?.response?.data?.title ?? 'Unknown error';
        } else {
          state.error.message = 'Unknown error';
        }
      });
  },
});

export default overviewOrgSlice.reducer;
export const {
  softDelete,
  softRestore,
  softDeleteAll,
  softRestoreAll,
  restoreAllSoftDeletedItems,
  setLoading,
} = overviewOrgSlice.actions;
