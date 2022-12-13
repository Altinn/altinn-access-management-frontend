import { configureStore } from '@reduxjs/toolkit';

import delegableApiReducer from '../features/delegableApi/delegableApiSlice';
import overviewOrgReducer from '../features/overviewOrg/overviewOrgSlice';
import delegableOrgReducer from '../features/delegableOrg/delegableOrgSlice';

const store = configureStore({
  reducer: {
    delegableApi: delegableApiReducer,
    overviewOrg: overviewOrgReducer,
    delegableOrg: delegableOrgReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
