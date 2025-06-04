import { http, passthrough, HttpResponse } from 'msw';
import { resourceHandler } from './handlers/resource';
import { apiDelegationHandlers } from './handlers/apiDelegation';
import { userHandlers } from './handlers/user';
import { singlerightHandlers } from './handlers/singleright';
import { accessPackageHandlers } from './handlers/accessPackage';
import { lookupHandlers } from './handlers/lookup';
import { systemUserHandlers } from './handlers/systemUser';
import { rightholdersHandlers } from './handlers/rightholders';

export const ACCESSMANAGEMENT_BASE_URL = 'http://localhost:6006/accessmanagement/api/v1';

export const handlers = [
  ...apiDelegationHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...resourceHandler(ACCESSMANAGEMENT_BASE_URL),
  ...userHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...singlerightHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...accessPackageHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...lookupHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...systemUserHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...rightholdersHandlers(ACCESSMANAGEMENT_BASE_URL),

  http.get('*', () => {
    return passthrough();
  }),
];
