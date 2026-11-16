import { http, HttpResponse } from 'msw';

export const resourceHandler = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(ACCESSMANAGEMENT_BASE_URL + '/resources/search', () => {
    return HttpResponse.json({
      page: 1,
      numEntriesTotal: 2,
      pageList: [
        {
          identifier: 'appid-502',
          title: 'Det magiske klesskapet - lenketjeneste',
          description: 'Det magiske klesskapet',
          rightDescription: 'Gir tilgang til Narnia.',
          homepage: null,
          status: null,
          contactPoints: [
            {
              category: 'Some category',
              email: 'email@someemaildigdir.no',
              telephone: '12345678',
              contactPage: 'Some page (webpage maybe?)',
            },
          ],
          delegable: true,
          visible: true,
          resourceOwnerName: 'NARNIA',
          resourceOwnerOrgNumber: '777777777',
          resourceOwnerOrgcode: 'ttd',
          resourceReferences: [
            {
              ReferenceSource: 'Altinn3',
              Reference: 'ttd/a3-app',
              ReferenceType: 'ApplicationId',
            },
          ],
          priorityCounter: 2,
          resourceType: 'Default',
          keywords: ['klesskapet_kw'],
        },
        {
          identifier: 'appid-503',
          title: 'Snarveien - lenketjeneste',
          description: 'Snarveien som lenketjeneste',
          rightDescription: 'Gir tilgang til snarveier.',
          resourceOwnerName: 'Snarveien',
          homepage: null,
          status: null,
          contactPoints: [
            {
              category: 'Some category',
              email: 'email@someemaildigdir.no',
              telephone: '12345678',
              contactPage: 'Some page (webpage maybe?)',
            },
          ],
          delegable: true,
        },
        {
          identifier: 'missing_role_access',
          title: 'Krever Rolle',
          description: 'Denne ressursen krever spesifikke roller for tilgang.',
          rightDescription: 'Denne ressursen krever spesifikke roller for tilgang.',
          delegable: true,
          resourceOwnerName: 'Manglende Rolle',
        },
        {
          identifier: 'missing_right_access',
          title: 'Krever Rettighet',
          description: 'Denne ressursen krever spesifikke rettigheter for tilgang.',
          rightDescription: 'Denne ressursen krever spesifikke rettigheter for tilgang.',
          delegable: true,
          resourceOwnerName: 'Manglende Rettigheter',
        },
        {
          identifier: 'missing_srr_rightAccess',
          title: 'Krever SRR Tilgang',
          description: 'Denne ressursen krever SRR rettigheter for tilgang.',
          rightDescription: 'Denne ressursen krever SRR rettigheter for tilgang.',
          delegable: true,
          resourceOwnerName: 'Manglende SRR Rettigheter',
        },
        {
          identifier: 'delegation_error',
          title: 'Delegering feilet',
          description: 'Denne ressursen feiler ved delegering.',
          rightDescription: 'Denne ressursen feiler ved delegering.',
          delegable: true,
          resourceOwnerName: 'Delegeringsfeil',
        },
        {
          identifier: 'partial_delegation_error',
          title: 'Delegering delvis feilet',
          description: 'Denne ressursen feiler delvis ved delegering.',
          rightDescription: 'Denne ressursen feiler delvis ved delegering.',
          delegable: true,
          resourceOwnerName: 'Delegeringsfeil',
        },
      ],
    });
  }),
  http.get(ACCESSMANAGEMENT_BASE_URL + '/resources/resourceowners', () => {
    return HttpResponse.json([
      {
        organisationName: 'NARNIA',
        organisationNumber: '889640782',
      },
    ]);
  }),
];
