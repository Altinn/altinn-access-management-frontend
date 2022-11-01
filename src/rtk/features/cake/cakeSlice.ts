import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialState {
  numOfCakes: number;
}

const initialState: InitialState = {
  numOfCakes: 10,
};

export const cakeSlice = createSlice({
  name: 'cake',
  initialState,
  reducers: {
    ordered: (state) => {
      state.numOfCakes--;
    },
    restocked: (state, action: PayloadAction<number>) => {
      state.numOfCakes += action.payload;
    },
  },
});

export default cakeSlice.reducer;
export const { ordered, restocked } = cakeSlice.actions;
