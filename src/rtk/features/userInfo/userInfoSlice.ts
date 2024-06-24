import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface SliceState {
  userLoading: boolean;
  reporteeLoading: boolean;
  personName: string;
  reporteeName: string;
  userInfoError: string;
  reporteeError: string;
  reporteeOrgNumber: string;
}

const initialState: SliceState = {
  userLoading: true,
  reporteeLoading: true,
  personName: '',
  reporteeName: '',
  userInfoError: '',
  reporteeError: '',
  reporteeOrgNumber: '',
};

// TODO: Make this entire slice into an rtkQuery Api
export const fetchUserInfo = createAsyncThunk('userInfo/fetchUserInfoSlice', async () => {
  return await axios
    .get('/accessmanagement/api/v1/user/profile')
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw new Error(String(error.response.data));
    });
});

export const fetchReportee = createAsyncThunk('userInfo/fetchReportee', async () => {
  const altinnPartyId = getCookie('AltinnPartyId');
  return await axios
    .get(`/accessmanagement/api/v1/user/reporteelist/${altinnPartyId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
      throw new Error(String(error.response.data));
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
        state.personName = dataArray.party.name;
        state.userLoading = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.userInfoError = action.error.message ?? 'Unknown error';
      })
      .addCase(fetchReportee.fulfilled, (state, action) => {
        const reporteeDataArray = action.payload;
        state.reporteeName = reporteeDataArray.name;
        state.reporteeLoading = false;
        state.reporteeOrgNumber = reporteeDataArray.organizationNumber;
      })
      .addCase(fetchReportee.rejected, (state, action) => {
        state.reporteeError = action.error.message ?? 'Unknown error';
      });
  },
});

export default userInfoSlice.reducer;
