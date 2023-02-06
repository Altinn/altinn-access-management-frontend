import { createSlice } from '@reduxjs/toolkit';

interface UserInfo {
  name: string;
  reporteeName: string;
}

export interface InitialState {
  loading: boolean;
  userInfo: UserInfo;
  error: string;
}

const initialState: InitialState = {
  loading: false,
  userInfo: {
    name: '',
    reporteeName: '',
  },
  error: '',
};

const userInfoSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    softAddOrg: (state, action) => {
      console.log(state);
    },
  },
});

export default userInfoSlice.reducer;
export const { softAddOrg } = userInfoSlice.actions;
