import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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

export interface InitialState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  error: string;
}

const initialState: InitialState = {
  loading: false,
  overviewOrgs: [
    {
      id: '1',
      orgName: 'Netcompany',
      orgNr: '123456789',
      isAllSoftDeleted: false,
      apiList: [
        {
          id: '1',
          apiName: 'Delegert API A',
          isSoftDelete: false,
          owner: 'Brønnøysundregisterene',
          description:
            'kan du registrere og endre opplysninger på bedrift, finne bedriftsinformasjon og kunngjøringer, sjekke heftelser i bil og stoppe telefonsalg.',
        },
        {
          id: '2',
          apiName: 'Delegert API B',
          isSoftDelete: false,
          owner: 'Accenture',
          description:
            'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
        },
      ],
    },
    {
      id: '2',
      orgName: 'Tieto',
      orgNr: '950124321',
      isAllSoftDeleted: false,
      apiList: [
        {
          id: '1',
          apiName: 'Delegert API A',
          isSoftDelete: false,
          owner: 'Avanade',
          description:
            'kan du registrere og endre opplysninger på bedrift, finne bedriftsinformasjon og kunngjøringer, sjekke heftelser i bil og stoppe telefonsalg.',
        },
        {
          id: '2',
          apiName: 'Delegert API B',
          isSoftDelete: false,
          owner: 'Accenture',
          description:
            'Accenture er et forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
        },
      ],
    },
  ],
  error: '',
};

const setAllItemsToGivenSoftDeleteState = (
  state: InitialState,
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
    name: org.orgName,
    isAllSoftDeleted: false,
    orgNr: org.orgNr,
    apiList: [],
  };
};

export const fetchOverviewOrgs = createAsyncThunk('overviewOrg/fetchOverviewOrgs', async () => {
  return await axios
    .get('https://jsonplaceholder.typicode.com/users')
    .then((response) => response.data)
    .catch((error) => console.log(error));
});

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
});

export default overviewOrgSlice.reducer;
export const {
  softDelete,
  softRestore,
  softDeleteAll,
  softRestoreAll,
  save,
  restoreAllSoftDeletedItems,
} = overviewOrgSlice.actions;
