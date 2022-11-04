import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import cakeReducer from '../features/examples/cake/cakeSlice';
import iceCreamReducer from '../features/examples/icecream/icecreamSlice';
import userReducer from '../features/examples/user/userSlice';
import delegableOrgApiReducer from '../features/delegableOrgApi/delegableOrgApiSlice';

const logger = createLogger();

const store = configureStore({
  reducer: {
    cake: cakeReducer,
    icecream: iceCreamReducer,
    user: userReducer,
    delegableOrgApi: delegableOrgApiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
