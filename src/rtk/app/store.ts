import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import delegableApiReducer from '../features/apiDelegation/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/apiDelegation/overviewOrg/overviewOrgSlice';
import delegableOrgReducer from '../features/apiDelegation/delegableOrg/delegableOrgSlice';
import delegationRequestReducer from '../features/apiDelegation/delegationRequest/delegationRequestSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';
import { singleRightsApi } from '../features/singleRights/singleRightsApi';
import singleRightsReducer from '../features/singleRights/singleRightsSlice';
import { apiDelegationApi } from '../features/apiDelegation/apiDelegationApi';

const logger = createLogger();

const store = configureStore({
  reducer: {
    delegableApi: delegableApiReducer,
    overviewOrg: overviewOrgReducer,
    delegableOrg: delegableOrgReducer,
    delegationRequest: delegationRequestReducer,
    userInfo: userInfoReducer,
    singleRightsSlice: singleRightsReducer,
    [singleRightsApi.reducerPath]: singleRightsApi.reducer,
    [apiDelegationApi.reducerPath]: apiDelegationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, singleRightsApi.middleware, apiDelegationApi.middleware),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
