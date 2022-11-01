import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import cakeReducer from '../features/cake/cakeSlice';
import iceCreamReducer from '../features/icecream/icecreamSlice';
import userReducer from '../features/user/userSlice';

const logger = createLogger();

const store = configureStore({
  reducer: {
    cake: cakeReducer,
    icecream: iceCreamReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
