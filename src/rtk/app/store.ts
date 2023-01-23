import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import delegableApiReducer from '../features/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/overviewOrg/overviewOrgSlice';
import delegableOrgReducer from '../features/delegableOrg/delegableOrgSlice';

const logger = createLogger();

// turn off redux-logger in production
const store = import.meta.env.DEV
  ? configureStore({
      reducer: {
        delegableApi: delegableApiReducer,
        overviewOrg: overviewOrgReducer,
        delegableOrg: delegableOrgReducer,
      },
    })
  : configureStore({
      reducer: {
        delegableApi: delegableApiReducer,
        overviewOrg: overviewOrgReducer,
        delegableOrg: delegableOrgReducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    });

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
