import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import delegableApiReducer from '../features/apiDelegation/delegableApi/delegableApiSlice';
import apiDelegationReducer from '../features/apiDelegation/apiDelegationSlice';
import { singleRightsApi } from '../features/singleRights/singleRightsApi';
import singleRightsReducer from '../features/singleRights/singleRightsSlice';
import { apiDelegationApi } from '../features/apiDelegation/apiDelegationApi';
import { overviewOrgApi } from '../features/apiDelegation/overviewOrg/overviewOrgApi';
import { resourceApi } from '../features/resourceApi';
import { lookupApi } from '../features/lookup/lookupApi';
import { userInfoApi } from '../features/userInfo/userInfoApi';

const logger = createLogger();

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      logger,
      lookupApi.middleware,
      singleRightsApi.middleware,
      apiDelegationApi.middleware,
      overviewOrgApi.middleware,
      resourceApi.middleware,
      userInfoApi.middleware,
    ),
});

setupListeners(store.dispatch);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
