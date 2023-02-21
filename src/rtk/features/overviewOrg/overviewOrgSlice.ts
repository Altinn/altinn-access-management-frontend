/* eslint-disable @typescript-eslint/restrict-plus-operands */
import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';

import { LayoutState } from '@/components/apiDelegation/reusables/LayoutState';
import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface ApiListItem {
  id: string;
  apiName: string;
  isSoftDelete: boolean;
  owner: string;
  description: string;
}

export interface OverviewOrg {
  id: string;
  orgName: string;
  orgNr: string;
  isAllSoftDeleted: boolean;
  apiList: ApiListItem[];
}

interface DelegationDTO {
  coveredByName: string;
  offeredByName: string;
  offeredByOrganizationNumber: string;
  coveredByOrganizationNumber: string;
  resourceId: string;
  resourceTitle: languageDto;
  hasCompetentAuthority: HasCompetentAuthorityDTO;
  rightDescription: languageDto;
}

export interface SliceState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  error: string;
}

interface HasCompetentAuthorityDTO {
  organization: string;
  orgcode: string;
  name: languageDto;
}

interface languageDto {
  en: string;
  nb: string;
  nn: string;
}

const initialState: SliceState = {
  loading: true,
  overviewOrgs: [],
  error: '',
};

const mapToOverviewOrgList = (delegationArray: DelegationDTO[], layout: LayoutState) => {
  const overviewOrgList: OverviewOrg[] = [];
  for (const delegation of delegationArray) {
    let apiName = '';
    let description = '';
    let owner = '';
    switch (i18next.language) {
      case 'no_nb':
        apiName = delegation.resourceTitle.nb;
        description = delegation.rightDescription.nb;
        owner = delegation.hasCompetentAuthority.name.nb;
        break;
      case 'no_nn':
        apiName = delegation.resourceTitle.nn;
        description = delegation.rightDescription.nn;
        owner = delegation.hasCompetentAuthority.name.nn;
        break;
      case 'en':
        apiName = delegation.resourceTitle.en;
        description = delegation.rightDescription.en;
        owner = delegation.hasCompetentAuthority.name.en;
        break;
    }

    const api: ApiListItem = {
      id: delegation.resourceId,
      apiName,
      isSoftDelete: false,
      owner,
      description,
    };

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
  async () => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }
    // TODO: This may fail in AT if axios doesn't automatically change the base url
    return await axios
      .get(`/accessmanagement/api/v1/bff/${altinnPartyId}/delegations/maskinportenschema/offered`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw new Error(String(error.response.status));
      });
  },
);

export const deleteOfferedApiDelegations = createAsyncThunk(
  'overviewOrg/deleteApiDelegations',
  async () => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }

    return await axios
      .get(
        `/accessmanagement/api/v1/${altinnPartyId}/delegations/maskinportenschema/offered/revoke`,
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw new Error(String(error.response.status));
      });
  },
);

export const fetchOverviewOrgsReceived = createAsyncThunk(
  'overviewOrg/fetchOverviewOrgsReceived',
  async () => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }

    return await axios
      .get(`/accessmanagement/api/v1/bff/${altinnPartyId}/delegations/maskinportenschema/received`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw new Error(String(error.response.status));
      });
  },
);

export const deleteReceivedApiDelegations = createAsyncThunk(
  'overviewOrg/deleteApiDelegations',
  async () => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }

    return await axios
      .get(
        `/accessmanagement/api/v1/${altinnPartyId}/delegations/maskinportenschema/received/revoke`,
      )
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        throw new Error(String(error.response.status));
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
    save: (state) => {
      console.log(state.overviewOrgs);
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
        const dataArray = action.payload;
        const responseList: OverviewOrg[] = mapToOverviewOrgList(dataArray, LayoutState.Received);
        state.overviewOrgs = responseList;
        state.loading = false;
      })
      .addCase(fetchOverviewOrgsReceived.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(fetchOverviewOrgsOffered.fulfilled, (state, action) => {
        const dataArray = action.payload;
        const responseList: OverviewOrg[] = mapToOverviewOrgList(dataArray, LayoutState.Offered);
        state.overviewOrgs = responseList;
        state.loading = false;
      })
      .addCase(fetchOverviewOrgsOffered.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(deleteOfferedApiDelegations.fulfilled, (state, action) => {
        console.log('Success');
      });
  },
});

export default overviewOrgSlice.reducer;
export const {
  softDelete,
  softRestore,
  softDeleteAll,
  softRestoreAll,
  save,
  restoreAllSoftDeletedItems,
  setLoading,
} = overviewOrgSlice.actions;
