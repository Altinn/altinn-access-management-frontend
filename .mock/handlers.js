import { http, passthrough, HttpResponse } from 'msw';
import { resourceHandler } from './handlers/resource';
import { apiDelegationHandlers } from './handlers/apiDelegation';
import { userHandlers } from './handlers/user';
import { singlerightHandlers } from './handlers/singleright';
import { lookupHandlers } from './handlers/lookup';

export const ACCESSMANAGEMENT_BASE_URL = 'http://localhost:6006/accessmanagement/api/v1';

export const handlers = [
  ...apiDelegationHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...resourceHandler(ACCESSMANAGEMENT_BASE_URL),
  ...userHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...singlerightHandlers(ACCESSMANAGEMENT_BASE_URL),
  ...lookupHandlers(ACCESSMANAGEMENT_BASE_URL),

  http.get('*', () => {
    return passthrough();
  }),
];
