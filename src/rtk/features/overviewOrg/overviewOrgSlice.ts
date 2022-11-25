import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DeleteOrgDto } from '@/shared/dto/DeleteOrgDto';

export interface ApiListItem {
  id: string;
  name: string;
  isSoftDelete: boolean;
  owner: string;
  description: string;
}

export interface OverviewOrg {
  id: string;
  name: string;
  orgNr: string;
  isAllSoftDeleted: boolean;
  apiList: ApiListItem[];
}

export interface InitialState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  softDeletedOverviewOrgs: OverviewOrg[];
  error: string;
  overviewOrgIsEditable: boolean;
}

const initialState: InitialState = {
  loading: false,
  overviewOrgs: [
    {
      id: '1',
      name: 'Evry',
      orgNr: '123456789',
      isAllSoftDeleted: false,
      apiList: [
        {
          id: '1',
          name: 'Delegert API A',
          isSoftDelete: false,
          owner: 'Brønnøysundregisterene',
          description:
            'kan du registrere og endre opplysninger på bedrift, finne bedriftsinformasjon og kunngjøringer, sjekke heftelser i bil og stoppe telefonsalg.',
        },
        {
          id: '2',
          name: 'Delegert API B',
          isSoftDelete: false,
          owner: 'Accenture',
          description:
            'Accenture er et forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
        },
      ],
    },
    {
      id: '2',
      name: 'Skatteetaten',
      orgNr: '123456789',
      isAllSoftDeleted: false,
      apiList: [
        {
          id: '1',
          name: 'Delegert API A',
          isSoftDelete: false,
          owner: 'Brønnøysundregisterene',
          description:
            'kan du registrere og endre opplysninger på bedrift, finne bedriftsinformasjon og kunngjøringer, sjekke heftelser i bil og stoppe telefonsalg.',
        },
        {
          id: '2',
          name: 'Delegert API B',
          isSoftDelete: false,
          owner: 'Accenture',
          description:
            'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
        },
      ],
    },
  ],
  overviewOrgIsEditable: false,
  softDeletedOverviewOrgs: [],
  error: '',
};

const removeSoftDeletedOrgReference = (state: InitialState, orgId: string) => {
  const { softDeletedOverviewOrgs: softDeletedItems } = state;

  state.softDeletedOverviewOrgs = softDeletedItems.filter((org) => org.id !== orgId);
};

const setSoftDeleteState = (
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
    name: org.name,
    isAllSoftDeleted: false,
    orgNr: org.orgNr,
    apiList: [],
  };
};

const mapToSoftDeletedOrgDto = (state: InitialState) => {
  const softDeletedOrgDtoList = [];
  for (const item of state.softDeletedOverviewOrgs) {
    softDeletedOrgDtoList.push(new DeleteOrgDto(item.id, item.name, item.apiList));
  }
  return softDeletedOrgDtoList;
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
              state.softDeletedOverviewOrgs.push(copyOrg);
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
    softUndelete: (state, action) => {
      const selectedOrgId = action.payload[0];
      const undeletedListItemId = action.payload[1];
      for (const org of state.softDeletedOverviewOrgs) {
        if (org.id === selectedOrgId) {
          org.apiList = org.apiList.filter((item) => item.id !== undeletedListItemId);
        }
        if (org.apiList.length === 0) {
          const { softDeletedOverviewOrgs } = state;
          state.softDeletedOverviewOrgs = softDeletedOverviewOrgs.filter(
            (org) => org.id !== selectedOrgId,
          );
          break;
        }
      }

      for (const org of state.overviewOrgs) {
        if (org.id === selectedOrgId) {
          for (const item of org.apiList) {
            if (item.id === undeletedListItemId) {
              item.isSoftDelete = false;
            }
          }
          org.isAllSoftDeleted = false;
          break;
        }
      }
    },
    save: (state) => {
      const list = mapToSoftDeletedOrgDto(state);
      console.log(list);
    },
    softUndeleteAll: (state, action) => {
      const undeletedOrgId = action.payload;
      for (const org of state.softDeletedOverviewOrgs) {
        if (org.id === undeletedOrgId) {
          removeSoftDeletedOrgReference(state, undeletedOrgId);
          break;
        }
      }

      setSoftDeleteState(state, undeletedOrgId, false);
    },
    softDeleteAll: (state, action) => {
      const selectedOrgId = action.payload;
      for (const softDeletedOrg of state.softDeletedOverviewOrgs) {
        if (softDeletedOrg.id === selectedOrgId) {
          removeSoftDeletedOrgReference(state, selectedOrgId);
        }
      }
      state.softDeletedOverviewOrgs.push(selectedOrgId);

      setSoftDeleteState(state, selectedOrgId, true);
    },
    setIsEditable: (state, action) => {
      state.overviewOrgIsEditable = action.payload;
    },
    emptySoftDeletedList: (state) => {
      for (const org of state.overviewOrgs) {
        org.isAllSoftDeleted = false;
        for (const item of org.apiList) {
          item.isSoftDelete = false;
        }
        org.isAllSoftDeleted = false;
      }
      state.softDeletedOverviewOrgs = [];
    },
  },
});

export default overviewOrgSlice.reducer;
export const {
  softDelete,
  softUndelete,
  softDeleteAll,
  softUndeleteAll,
  setIsEditable,
  save,
  emptySoftDeletedList,
} = overviewOrgSlice.actions;
