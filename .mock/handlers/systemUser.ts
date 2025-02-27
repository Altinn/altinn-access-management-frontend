import { http, HttpResponse } from 'msw';

export const systemUserHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/systemuser/*`, () => {
    return HttpResponse.json([]);
  }),
];
