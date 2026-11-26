// Each test has a dedicated company profile admin and organisation to avoid parallel conflicts.
export const ACTORS = {
  leggTilEpost: { pid: '14817198504', org: '314242394', orgName: 'LAV PLEIENDE TIGER AS' },
  ugyldigEpost: { pid: '15865898816', org: '310409855', orgName: 'STERK SUBTIL APE' },
  leggTilSms: { pid: '24856398710', org: '312939053', orgName: 'KULTURELL UPOPULÆR TIGER AS' },
  endreAdresse: { pid: '23885997783', org: '210486372', orgName: 'NYSGJERRIG FORNEM PUMA BBL' },
  slettAdresse: {
    pid: '11863047716',
    org: '214240432',
    orgName: 'FORSTÅELSESFULL LOGISK TIGER AS',
  },
  sisteAdresse: {
    pid: '22856996909',
    org: '313363376',
    orgName: 'REFLEKTERENDE IHERDIG TIGER AS',
  },
};

// The admin grants the user access to the organisation without company profile admin rights.
export const IKKE_ADMIN = {
  admin: { pid: '20929798962', org: '310442992', orgName: 'LIVLIG SØT KATT SOKK' },
  bruker: { pid: '03820699628' },
};

export const BASELINE_EPOST = 'playwright-baseline@example.com';
