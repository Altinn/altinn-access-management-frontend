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
];
