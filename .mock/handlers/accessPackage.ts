import { http, HttpResponse } from 'msw';

export const accessPackageHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/role/assignments/:ownerId/:holderId`, () => {
    HttpResponse.json([
      {
        id: '461b0ec2-6795-4055-9306-2acefd7c6a31  ',
        roleId: 'de42ae15-c265-42b3-8060-64c779684902',
        fromId: 'cd35779b-b174-4ecc-bbef-ece13611be7f',
        toId: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        role: {
          id: 'de42ae15-c265-42b3-8060-64c779684902',
          name: 'Styremedlem',
          code: 'MEDL',
          description: 'Fysisk- eller juridisk person som inngår i et styre',
        },
      },
      {
        id: '43f42152-8900-4fcf-ac70-62d2d566581c',
        roleId: 'de42ae15-c265-42b3-8060-64c779684902',
        fromId: 'cd35779b-b174-4ecc-bbef-ece13611be7f',
        toId: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        role: {
          id: '72c336a2-1705-4aef-b220-7f4aa6c0e69d',
          name: 'Styrets leder',
          code: 'LEDE',
          description: 'Fysisk- eller juridisk person som er styremedlem og leder et styre',
        },
      },
    ]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/search`, () => {
    return HttpResponse.json([
      {
        id: '589217CF-6070-474F-9989-8C5359C740F4',
        name: 'Bygg og anlegg',
        description: 'For de som bygger med anlegg',
        iconUrl: 'https://www.svgrepo.com/show/437004/hammer.svg',
        accessPackages: [
          {
            id: '3490203E-876E-4EF9-B774-9A0CD9B7E9CD',
            name: 'Kjøp og salg av eiendom',
            description:
              'Denne tilgangspakken gir fullmakter til tjenester knyttet til kjøp og salg av eiendom. Ved regelverksendringer eller innføring av nye digitale tjenester kan det bli endringer i tilganger som fullmakten gir.',
            area: {
              id: '589217CF-6070-474F-9989-8C5359C740F4',
              name: 'Bygg og anlegg',
              description: 'For de som bygger med anlegg',
              iconUrl: 'https://www.svgrepo.com/show/437004/hammer.svg',
            },
          },
          {
            id: '3490203E-876E-4EF9-B774-9A0CD9B7E9CC',
            name: 'Annleggsadministrasjon',
            description:
              'Denne tilgangspakken gir fullmakter til tjenester knyttet til kjøp og salg av eiendom. Ved regelverksendringer eller innføring av nye digitale tjenester kan det bli endringer i tilganger som fullmakten gir.',
            area: {
              id: '589217CF-6070-474F-9989-8C5359C740F4',
              name: 'Bygg og anlegg',
              description: 'For de som bygger med anlegg',
              iconUrl: 'https://www.svgrepo.com/show/437004/hammer.svg',
            },
          },
        ],
      },
      {
        id: '589217CF-6070-474F-9989-8C5359C740GG',
        name: 'Overnaturligheter',
        description:
          'Howl on top of tall thing walk on keyboard or fight own tail or look pawmazing and drink the soapy mopping up water then puke giant foamy fur-balls.',
        iconUrl: 'https://www.svgrepo.com/show/509156/magic-wand.svg',
        accessPackages: [
          {
            id: '3490203E-876E-4EF9-B774-9A0CD9B7E9CFG',
            name: 'Magibruk',
            description:
              'Cat ipsum dolor sit amet, i will ruin the couch with my claws and have secret plans so pretend not to be evil.',
            area: {
              id: '589217CF-6070-474F-9989-8C5359C740GG',
              name: 'Overnaturligheter',
              description:
                'Howl on top of tall thing walk on keyboard or fight own tail or look pawmazing and drink the soapy mopping up water then puke giant foamy fur-balls.',
              iconUrl: 'https://www.svgrepo.com/show/509156/magic-wand.svg',
            },
          },
        ],
      },
    ]);
  }),
];
