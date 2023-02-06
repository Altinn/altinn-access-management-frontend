import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import delegableApiReducer from '../features/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/overviewOrg/overviewOrgSlice';
import delegableOrgReducer from '../features/delegableOrg/delegableOrgSlice';
import delegationRequestReducer from '../features/delegationRequest/delegationRequestSlice';
import userInfoReducer from '../features/userInfo/userInfoSlice';

const logger = createLogger();

// turn off redux-logger in production
const store = import.meta.env.PROD
  ? configureStore({
      reducer: {
        delegableApi: delegableApiReducer,
        overviewOrg: overviewOrgReducer,
        delegableOrg: delegableOrgReducer,
        delegationRequest: delegationRequestReducer,
        userInfo: userInfoReducer,
      },
    })
  : configureStore({
      reducer: {
        delegableApi: delegableApiReducer,
        overviewOrg: overviewOrgReducer,
        delegableOrg: delegableOrgReducer,
        delegationRequest: delegationRequestReducer,
        userInfo: userInfoReducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    });

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
