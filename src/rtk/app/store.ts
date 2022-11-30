import { configureStore } from '@reduxjs/toolkit';

import delegableApiReducer from '../features/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/overviewOrg/overviewOrgSlice';

// turn off redux-logger in production
const store = configureStore({
  reducer: {
    delegableApi: delegableApiReducer,
    overviewOrg: overviewOrgReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
