import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import delegableApiReducer from '../features/apiDelegation/delegableApi/delegableApiSlice';
import apiDelegationReducer from '../features/apiDelegation/apiDelegationSlice';
import { singleRightsApi } from '../features/singleRights/singleRightsApi';
import singleRightsReducer from '../features/singleRights/singleRightsSlice';
import { apiDelegationApi } from '../features/apiDelegation/apiDelegationApi';
import { overviewOrgApi } from '../features/apiDelegation/overviewOrg/overviewOrgApi';
import { resourceApi } from '../features/resourceApi';
import { accessPackageApi } from '../features/accessPackageApi';
import { lookupApi } from '../features/lookupApi';
import { userInfoApi } from '../features/userInfoApi';
import { roleApi } from '../features/roleApi';
import { systemUserApi } from '../features/systemUserApi';
import { consentApi } from '../features/consentApi';
import { altinnCdnApi } from '../features/altinnCdnApi';

const store = configureStore({
  reducer: {
    delegableApi: delegableApiReducer,
    apiDelegation: apiDelegationReducer,
    singleRightsSlice: singleRightsReducer,
    [userInfoApi.reducerPath]: userInfoApi.reducer,
    [lookupApi.reducerPath]: lookupApi.reducer,
    [singleRightsApi.reducerPath]: singleRightsApi.reducer,
    [apiDelegationApi.reducerPath]: apiDelegationApi.reducer,
    [overviewOrgApi.reducerPath]: overviewOrgApi.reducer,
    [resourceApi.reducerPath]: resourceApi.reducer,
    [accessPackageApi.reducerPath]: accessPackageApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [systemUserApi.reducerPath]: systemUserApi.reducer,
    [consentApi.reducerPath]: consentApi.reducer,
    [altinnCdnApi.reducerPath]: altinnCdnApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      lookupApi.middleware,
      singleRightsApi.middleware,
      apiDelegationApi.middleware,
      overviewOrgApi.middleware,
      resourceApi.middleware,
      userInfoApi.middleware,
      accessPackageApi.middleware,
      roleApi.middleware,
      systemUserApi.middleware,
      consentApi.middleware,
      altinnCdnApi.middleware,
    ),
});

setupListeners(store.dispatch);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
