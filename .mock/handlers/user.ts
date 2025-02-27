import { http, HttpResponse } from 'msw';

export const userHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/reporteelist/:id`, () => {
    return HttpResponse.json({
      partyUuid: '54f128f7-ca7c-4a57-ad49-3787eb79b506',
      name: 'DISKRET NÆR TIGER AS',
      organizationNumber: '310202398',
      subunits: [
        {
          partyUuid: '0020c970-ba68-44cd-8440-0894b594f58a',
          name: 'DISKRET NÆR TIGER AS',
          organizationNumber: '311312294',
          subunits: [],
        },
      ],
    });
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/profile`, () => {
    return HttpResponse.json({
      userId: 20010996,
      userUuid: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
      userName: 'GullMedalje',
      partyId: 50789533,
      party: {
        partyId: 50789533,
        partyUuid: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        name: 'SITRONGUL MEDALJONG',
      },
      userType: 1,
      profileSettingPreference: {
        language: 'nb',
        preSelectedPartyId: 0,
        doNotPromptForParty: false,
      },
    });
  }),
  http.post(
    new RegExp(`${ACCESSMANAGEMENT_BASE_URL}/user/reportee/(?:/[^/]+)?/rightholder/person`),
    async (req: any) => {
      const requestBody = await req.request.json();
      const ssn = requestBody?.ssn;
      const lastName = requestBody?.lastName;
      if (lastName.length < 4 || ssn.length !== 11) {
        return HttpResponse.json({ error: 'Invalid input' }, { status: 404 });
      } else {
        return HttpResponse.json({
          partyUuid: '54f128f7-ca7c-4a57-ad49-3787eb79b506',
        });
      }
    },
  ),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/reportee/:id`, () => {
    return HttpResponse.json({
      partyUuid: '2a2f6ea4-ae81-4098-8e14-a68dec6f9aac',
      name: 'LEVENDE KUNSTIG APE',
      organizationNumber: '312787075',
      partyId: 51506003,
      type: 'Organization',
      unitType: 'FLI',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      authorizedResources: [],
      authorizedRoles: [
        'LEDE',
        'LOPER',
        'ADMAI',
        'REGNA',
        'SISKD',
        'UILUF',
        'UTINN',
        'UTOMR',
        'KLADM',
        'ATTST',
        'HVASK',
        'PAVAD',
        'SIGNE',
        'UIHTL',
        'KOMAB',
        'HADM',
        'PASIG',
        'A0278',
        'A0236',
        'A0212',
        'APIADM',
        'A0298',
      ],
      subunits: [
        {
          partyUuid: 'fc2e9a43-c74b-42aa-9656-fbae2fabe950',
          name: 'LEVENDE KUNSTIG APE',
          organizationNumber: '311918265',
          partyId: 51505983,
          type: 'Organization',
          unitType: 'AAFY',
          isDeleted: false,
          onlyHierarchyElementWithNoAccess: false,
          authorizedResources: [],
          authorizedRoles: [
            'LEDE',
            'LOPER',
            'ADMAI',
            'REGNA',
            'SISKD',
            'UILUF',
            'UTINN',
            'UTOMR',
            'KLADM',
            'ATTST',
            'HVASK',
            'PAVAD',
            'SIGNE',
            'UIHTL',
            'KOMAB',
            'HADM',
            'PASIG',
            'A0278',
            'A0236',
            'A0212',
            'APIADM',
            'A0298',
          ],
          subunits: [],
        },
      ],
    });
  }),
];
