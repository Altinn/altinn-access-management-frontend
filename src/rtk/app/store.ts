import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import delegableApiReducer from '../features/apiDelegation/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/apiDelegation/overviewOrg/overviewOrgSlice';
import delegableOrgReducer from '../features/apiDelegation/delegableOrg/delegableOrgSlice';
import delegationRequestReducer from '../features/apiDelegation/delegationRequest/delegationRequestSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';
import { singleRightsApi } from '../features/singleRights/singleRightsApi';
import singleRightsReducer from '../features/singleRights/singleRightsSlice';
import { apiDelegationApi } from '../features/apiDelegation/apiDelegationApi';
import { lookupApi } from '../features/lookup/lookupApi';

const logger = createLogger();

const store = configureStore({
  reducer: {
    delegableApi: delegableApiReducer,
    overviewOrg: overviewOrgReducer,
    delegableOrg: delegableOrgReducer,
    delegationRequest: delegationRequestReducer,
    userInfo: userInfoReducer,
    singleRightsSlice: singleRightsReducer,
    [lookupApi.reducerPath]: lookupApi.reducer,
    [singleRightsApi.reducerPath]: singleRightsApi.reducer,
    [apiDelegationApi.reducerPath]: apiDelegationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      logger,
      lookupApi.middleware,
      singleRightsApi.middleware,
      apiDelegationApi.middleware,
    ),
});

setupListeners(store.dispatch);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
