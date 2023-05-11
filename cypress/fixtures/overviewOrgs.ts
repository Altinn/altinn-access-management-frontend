/*   
overviewOrgs: [
    {
      id: '1',
      orgName: 'Skatteetaten',
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
      orgName: 'Brønnøysundregistrene',
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


export const fetchOverviewOrgsOffered = createAsyncThunk(
  'overviewOrg/fetchOverviewOrgsOffered',
  async () => {
    const altinnPartyId = getCookie('AltinnPartyId');

    if (!altinnPartyId) {
      throw new Error(String('Could not get AltinnPartyId cookie value'));
    }
    return await axios
      .get(`/accessmanagement/api/v1/${altinnPartyId}/delegations/maskinportenschema/offered`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(error);
        // throw new Error(String(error.response.status));
      });
  },
);

.addCase(fetchOverviewOrgsOffered.fulfilled, (state, action) => {
      state.loading = true;
      const dataArray = action.payload;
      // const responseList: OverviewOrg[] = mapToOverviewOrgList(dataArray, LayoutState.Offered);
        //state.overviewOrgs = responseList;
      state.loading = false;

);
  */

export {};
