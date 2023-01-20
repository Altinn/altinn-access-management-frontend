import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';

enum LayoutState {
  Given,
  Received,
}

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
}

export interface SliceState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  error: string;
  layout: LayoutState;
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
  layout: LayoutState.Given,
};

const mapToOverviewOrgList = (delegationArray: DelegationDTO[], layout: LayoutState) => {
  const overviewOrgList: OverviewOrg[] = [];
  for (const delegation of delegationArray) {
    let apiName = '';
    switch (i18next.language) {
      case 'no_nb':
        apiName = delegation.resourceTitle.nb;
        break;
      case 'no_nn':
        apiName = delegation.resourceTitle.nn;
        break;
      case 'en':
        apiName = delegation.resourceTitle.en;
        break;
    }

    const api: ApiListItem = {
      id: delegation.resourceId,
      apiName,
      isSoftDelete: false,
      owner: 'Owner unknown',
      description: 'Description missing',
    };

    let delegationOrg = '';
    let delegationOrgNumber = '';
    switch (layout) {
      case LayoutState.Given:
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

const setAllItemsToGivenSoftDeleteState = (
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

export const fetchOverviewOrgs = createAsyncThunk(
  'overviewOrg/fetchOverviewOrgs',
  async (layout: LayoutState = LayoutState.Given) => {
    // TODO: Replace r500000 with partyid of actual logged in org
    switch (layout) {
      case LayoutState.Given:
        return await axios
          .get('/accessmanagement/api/v1/r500000/delegations/maskinportenschema/outbound')
          .then((response) => response.data)
          .catch((error) => console.log(error));
        break;
      case LayoutState.Received:
        return await axios
          .get('/accessmanagement/api/v1/r500000/delegations/maskinportenschema/inbound')
          .then((response) => response.data)
          .catch((error) => console.log(error));
        break;
    }
  },
);

const overviewOrgSlice = createSlice({
  name: 'overviewOrg',
  initialState,
  reducers: {
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
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

      setAllItemsToGivenSoftDeleteState(state, restoredOrgId, false);
    },
    softDeleteAll: (state, action) => {
      const selectedOrgId = action.payload;

      setAllItemsToGivenSoftDeleteState(state, selectedOrgId, true);
    },
    restoreAllSoftDeletedItems: (state) => {
      for (const org of state.overviewOrgs) {
        for (const item of org.apiList) {
          item.isSoftDelete = false;
        }
        org.isAllSoftDeleted = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewOrgs.fulfilled, (state, action) => {
        const dataArray = action.payload;
        const responseList: OverviewOrg[] = mapToOverviewOrgList(dataArray, state.layout);
        state.overviewOrgs = responseList;
        state.loading = false;
      })
      .addCase(fetchOverviewOrgs.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

export default overviewOrgSlice.reducer;
export const {
  setLayout,
  softDelete,
  softRestore,
  softDeleteAll,
  softRestoreAll,
  save,
  restoreAllSoftDeletedItems,
} = overviewOrgSlice.actions;
