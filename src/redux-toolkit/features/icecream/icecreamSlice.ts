import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  numOfIceCreams: 20,
};

export const iceCreamSlice = createSlice({
  name: 'icecream',
  initialState,
  reducers: {
    ordered: (state) => {
      state.numOfIceCreams--;
    },
    restocked: (state, action) => {
      state.numOfIceCreams += action.payload;
    },
  },
});
