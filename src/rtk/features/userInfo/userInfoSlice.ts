import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export interface InitialState {
  userLoading: boolean;
  reporteeLoading: boolean;
  name: string;
  reporteeName: string;
  error: string;
}

const initialState: InitialState = {
  userLoading: true,
  reporteeLoading: true,
  name: '',
  reporteeName: '',
  error: '',
};

export const fetchUserInfo = createAsyncThunk('userInfo/fetchUserInfoSlice', async () => {
  return await axios
    .get('/accessmanagement/api/v1/profile/user')
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw new Error(String(error.response.status));
    });
});

const userInfoSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        const dataArray = action.payload;
        state.name = dataArray.party.name;
        state.userLoading = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

export default userInfoSlice.reducer;
