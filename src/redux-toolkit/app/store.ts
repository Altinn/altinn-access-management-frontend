import { configureStore } from '@reduxjs/toolkit';

import { cakeReducer } from '../features/cake/cakeSlice';

export const store = configureStore({
  reducer: {
    cake: cakeReducer,
  },
});
