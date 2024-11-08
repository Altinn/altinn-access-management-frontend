import { http, HttpResponse } from 'msw';

export const lookupHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/lookup/org/:id`, () => {
    return HttpResponse.json({
      orgNumber: '991825827',
      name: 'Digitaliseringsdirektoratet',
    });
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/lookup/party`, () => {
    return HttpResponse.json({
      partyId: 51329012,
      partyUuid: 'cd35779b-b174-4ecc-bbef-ece13611be7f',
      partyTypeName: 2,
      orgNumber: '310202398',
      ssn: '',
      unitType: 'AS',
      name: 'DISKRET NÆR TIGER AS',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      person: null,
      organization: {
        orgNumber: '310202398',
        name: 'DISKRET NÆR TIGER AS',
        unitType: 'AS',
        telephoneNumber: '12345678',
        mobileNumber: '92010000',
        faxNumber: '92110000',
        eMailAddress: 'central@vikesaa.no',
        internetAddress: 'http://vikesaa.no',
        mailingAddress: 'Medalje Gate 1',
        mailingPostalCode: '0170',
        mailingPostalCity: 'Oslo',
        businessAddress: 'Medalje Gate 1',
        businessPostalCode: '0170',
        businessPostalCity: 'By',
        unitStatus: null,
      },
      childParties: null,
    });
  }),
];