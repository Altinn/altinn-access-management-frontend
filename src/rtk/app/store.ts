import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import delegableApiReducer from '../features/apiDelegation/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/apiDelegation/overviewOrg/overviewOrgSlice';
import apiDelegationReducer from '../features/apiDelegation/apiDelegationSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';
import { singleRightsApi } from '../features/singleRights/singleRightsApi';
import singleRightsReducer from '../features/singleRights/singleRightsSlice';
import { apiDelegationApi } from '../features/apiDelegation/apiDelegationApi';
import { resourceApi } from '../features/resourceApi';
import { lookupApi } from '../features/lookup/lookupApi';

const logger = createLogger();

const store = configureStore({
  reducer: {
    delegableApi: delegableApiReducer,
    overviewOrg: overviewOrgReducer,
    apiDelegation: apiDelegationReducer,
    userInfo: userInfoReducer,
    singleRightsSlice: singleRightsReducer,
    [lookupApi.reducerPath]: lookupApi.reducer,
    [singleRightsApi.reducerPath]: singleRightsApi.reducer,
    [apiDelegationApi.reducerPath]: apiDelegationApi.reducer,
    [resourceApi.reducerPath]: resourceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      logger,
      lookupApi.middleware,
      singleRightsApi.middleware,
      apiDelegationApi.middleware,
      resourceApi.middleware,
    ),
});

setupListeners(store.dispatch);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
