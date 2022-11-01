import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import { cakeReducer } from '../features/cake/cakeSlice';
import { iceCreamReducer } from '../features/icecream/icecreamSlice';
//import { reduxLogger } from 'redux-logger';



export const store = configureStore({
  reducer: {
    cake: cakeReducer,
    icecream: iceCreamReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
