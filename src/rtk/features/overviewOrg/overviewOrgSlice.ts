import axios from 'axios';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DeleteOrgDto } from '@/shared/dto/DeleteOrgDto';

export interface OverviewListItem {
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
  listItems: OverviewListItem[];
}

export interface InitialState {
  loading: boolean;
  overviewOrgs: OverviewOrg[];
  softDeletedItems: OverviewOrg[];
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
      listItems: [
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
      listItems: [
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
  softDeletedItems: [],
  error: '',
};

const removeSoftDeletedOrgReference = (
  state: InitialState,
  action: { payload: OverviewOrg; type: string },
) => {
  const { softDeletedItems } = state;

  state.softDeletedItems = softDeletedItems.filter((org) => org.id !== action.payload.id);
};

const setSoftDeleteState = ({
  state,
  action,
  isSoftDelete,
}: {
  state: InitialState;
  action: { payload: OverviewOrg; type: string };
  isSoftDelete: boolean;
}) => {
  for (const org of state.overviewOrgs) {
    if (org.id === action.payload.id) {
      for (const item of org.listItems) {
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
    listItems: [],
  };
};

const mapToSoftDeletedOrgDto = (state: InitialState) => {
  const softDeletedOrgDtoList = [];
  for (const item of state.softDeletedItems) {
    softDeletedOrgDtoList.push(new DeleteOrgDto(item.id, item.name, item.listItems));
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
      let orgIsAlreadyInList = false;

      for (const org of state.softDeletedItems) {
        if (org.id === action.payload[0].id) {
          org.listItems.push(action.payload[1]);
          orgIsAlreadyInList = true;
        }
      }
      for (const org of state.overviewOrgs) {
        if (org.id === action.payload[0].id) {
          const copyOrg: OverviewOrg = createCopyOrg(org);

          for (const item of org.listItems) {
            if (item.isSoftDelete) {
              softDeleteCount++;
            }
            if (item.id === action.payload[1].id) {
              item.isSoftDelete = true;
              softDeleteCount++;
              if (!orgIsAlreadyInList) {
                copyOrg.listItems.push(item);
                state.softDeletedItems.push(copyOrg);
              }
            }
            if (softDeleteCount === org.listItems.length) {
              org.isAllSoftDeleted = true;
            }
            if (softDeleteCount < org.listItems.length) {
              org.isAllSoftDeleted = false;
            }
          }
        }
      }
    },
    softUndo: (state, action) => {
      for (const org of state.softDeletedItems) {
        if (org.id === action.payload[0].id) {
          org.listItems = org.listItems.filter((item) => item.id !== action.payload[1].id);
        }
        if (org.listItems.length === 0) {
          const { softDeletedItems } = state;
          state.softDeletedItems = softDeletedItems.filter(
            (org) => org.id !== action.payload[0].id,
          );
          break;
        }
      }

      for (const org of state.overviewOrgs) {
        if (org.id === action.payload[0].id) {
          for (const item of org.listItems) {
            if (item.id === action.payload[1].id) {
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
    softUndoAll: (state, action) => {
      for (const org of state.softDeletedItems) {
        if (org.id === action.payload.id) {
          removeSoftDeletedOrgReference(state, action);
          break;
        }
      }

      setSoftDeleteState({ state, action, isSoftDelete: false });
    },
    softDeleteAll: (state, action) => {
      for (const softDeletedOrg of state.softDeletedItems) {
        if (softDeletedOrg.id === action.payload.id) {
          removeSoftDeletedOrgReference(state, action);
        }
      }
      state.softDeletedItems.push(action.payload);

      setSoftDeleteState({ state, action, isSoftDelete: true });
    },
    setOverviewOrgIsEditable: (state, action) => {
      state.overviewOrgIsEditable = action.payload;
    },
  },
});

export default overviewOrgSlice.reducer;
export const { softDelete, softUndo, softDeleteAll, softUndoAll, setOverviewOrgIsEditable, save } =
  overviewOrgSlice.actions;
