import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import cakeReducer from '../features/examples/cake/cakeSlice';
import iceCreamReducer from '../features/examples/icecream/icecreamSlice';
import userReducer from '../features/examples/user/userSlice';
import delegableApiReducer from '../features/delegableApi/delegableApiSlice';

const logger = createLogger();

const store = configureStore({
  reducer: {
    cake: cakeReducer,
    icecream: iceCreamReducer,
    user: userReducer,
    delegableApi: delegableApiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
