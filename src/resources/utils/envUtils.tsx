/// Enum with the different environments
export enum Environment {
  Development = 'Development',
  AT21 = 'AT21',
  AT22 = 'AT22',
  AT23 = 'AT23',
  AT24 = 'AT24',
  TT02 = 'TT02',
  PROD = 'PROD',
}

/// Function for getting the current environment from Url
export const getEnvFromUrl = () => {
  const hostname = window.location.hostname;

  if (hostname.includes('tt02')) {
    return Environment.TT02;
  } else if (hostname.includes('at21')) {
    return Environment.AT21;
  } else if (hostname.includes('at22')) {
    return Environment.AT22;
  } else if (hostname.includes('at23')) {
    return Environment.AT23;
  } else if (hostname.includes('at24')) {
    return Environment.AT24;
  } else {
    return Environment.PROD;
  }
};
