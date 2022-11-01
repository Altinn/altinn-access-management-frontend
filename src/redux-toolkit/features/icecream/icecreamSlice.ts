import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  numOfIceCreams: 20,
};

export const icecreamSlice = createSlice({
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

export const iceCreamReducer = icecreamSlice.reducer;
export const icecreamActions = icecreamSlice.actions;
