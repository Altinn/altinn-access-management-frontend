enum Environment {
  TT02 = 'tt02',
  PROD = 'prod',
  AT21 = 'at21',
  AT22 = 'at22',
  AT23 = 'at23',
  AT24 = 'at24',
}

export const getEnv = () => {
  const host = window.location.host;
  if (host.includes('tt02')) {
    return Environment.TT02;
  }
  if (host.includes('at21')) {
    return Environment.AT21;
  }
  if (host.includes('at22')) {
    return Environment.AT22;
  }
  if (host.includes('at23')) {
    return Environment.AT23;
  }
  if (host.includes('at24')) {
    return Environment.AT24;
  }
  return Environment.PROD;
};

export const getAltinnStartPageUrl = () => {
  const env = getEnv();

  switch (env) {
    case Environment.TT02:
      return 'https://info.tt02.altinn.no/';
    case Environment.AT21:
      return 'https://info.at21.altinn.cloud/';
    case Environment.AT22:
      return 'https://info.at22.altinn.cloud/';
    case Environment.AT23:
      return 'https://info.at23.altinn.cloud/';
    case Environment.AT24:
      return 'https://info.at24.altinn.cloud/';
    case Environment.PROD:
      return 'https://info.altinn.no/';
    default:
      return 'https://info.altinn.no/';
  }
};

export const getHostUrl = () => {
  const env = getEnv();
  switch (env) {
    case Environment.TT02:
      return 'https://tt02.altinn.no/';
    case Environment.AT21:
      return 'https://at21.altinn.cloud/';
    case Environment.AT22:
      return 'https://at22.altinn.cloud/';
    case Environment.AT23:
      return 'https://at23.altinn.cloud/';
    case Environment.AT24:
      return 'https://at24.altinn.cloud/';
    case Environment.PROD:
      return 'https://altinn.no/';
    default:
      return 'https://altinn.no/';
  }
};
