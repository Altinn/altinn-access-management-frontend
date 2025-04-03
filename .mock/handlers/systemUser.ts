import { http, HttpResponse } from 'msw';

export const systemUserHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/agent/:id`, () => {
    return HttpResponse.json([]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/:id`, () => {
    return HttpResponse.json([]);
  }),
];
