import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import { singleRightsApi } from '../features/singleRights/singleRightsApi';
import { resourceApi } from '../features/resourceApi';
import { accessPackageApi } from '../features/accessPackageApi';
import { lookupApi } from '../features/lookupApi';
import { settingsApi } from '../features/settingsApi';
import { userInfoApi } from '../features/userInfoApi';
import { roleApi } from '../features/roleApi';
import { systemUserApi } from '../features/systemUserApi';
import { consentApi } from '../features/consentApi';
import { altinnCdnApi } from '../features/altinnCdnApi';
import { connectionApi } from '../features/connectionApi';
import { clientApi } from '../features/clientApi';
import { instanceApi } from '../features/instanceApi';
import { requestApi } from '../features/requestApi';
import { selfIdentifiedUserApi } from '../features/selfIdentifiedUserApi';
import { maskinportenApi } from '../features/maskinportenApi';

const store = configureStore({
  reducer: {
    [userInfoApi.reducerPath]: userInfoApi.reducer,
    [connectionApi.reducerPath]: connectionApi.reducer,
    [lookupApi.reducerPath]: lookupApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [singleRightsApi.reducerPath]: singleRightsApi.reducer,
    [resourceApi.reducerPath]: resourceApi.reducer,
    [accessPackageApi.reducerPath]: accessPackageApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [systemUserApi.reducerPath]: systemUserApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [consentApi.reducerPath]: consentApi.reducer,
    [altinnCdnApi.reducerPath]: altinnCdnApi.reducer,
    [instanceApi.reducerPath]: instanceApi.reducer,
    [requestApi.reducerPath]: requestApi.reducer,
    [selfIdentifiedUserApi.reducerPath]: selfIdentifiedUserApi.reducer,
    [maskinportenApi.reducerPath]: maskinportenApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      lookupApi.middleware,
      singleRightsApi.middleware,
      resourceApi.middleware,
      userInfoApi.middleware,
      connectionApi.middleware,
      accessPackageApi.middleware,
      roleApi.middleware,
      systemUserApi.middleware,
      clientApi.middleware,
      consentApi.middleware,
      altinnCdnApi.middleware,
      instanceApi.middleware,
      settingsApi.middleware,
      requestApi.middleware,
      selfIdentifiedUserApi.middleware,
      maskinportenApi.middleware,
    ),
});

setupListeners(store.dispatch);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
