import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  alert: { open: false, message: '', type: '' },
  uploadedFiles: [],
  userDetails: null,
  userPermissions: null,
  drawerOpen: false,
  title: null,
  theme: null,
  openSettingDrawer: false,
  settingDrawerWidth: 0,
  timeIn: null,
  companyLogo: null
};

const commonReducersSlice = createSlice({
  name: "commonReducers",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setAlert(state, action) {
      state.alert = action.payload;
    },
    setUploadedFiles(state, action) {
      state.uploadedFiles = action.payload
    },
    handleDrawerClose(state, action) {
      state.drawerOpen = false
    },
    handleDrawerOpen(state, action) {
      state.drawerOpen = true
    },
    handleSetTitle(state, action) {
      state.title = action.payload
    },
    handleSetUserDetails(state, action) {
      state.userDetails = action.payload
    },
    handleSetUserPermissions(state, action) {
      state.userPermissions = action.payload
    },
    handleSetTheme(state, action) {
      state.theme = action.payload
    },
    handleToogleSettingDrawer(state, action) {
      if (state.openSettingDrawer) {
        state.openSettingDrawer = false
        state.settingDrawerWidth = 0
      } else {
        state.openSettingDrawer = true
        state.settingDrawerWidth = 350
      }
    },
    handleResetTheme(state, action) {
      state.theme = {
        primaryColor: "#666cff",
        sideNavigationBgColor: "#ffffff",
        contentBgColor: "#F7F7F9",
        headerBgColor: "#ffffff",
        textColor: "#262b43",
        iconColor: "#0000008a",
      }
    },
    handleSetTimeIn(state, action) {
      state.timeIn = action.payload
    },
    handleSetCompanyLogo(state, action) {
      state.companyLogo = action.payload
    },
  },
});

export const { setLoading, setAlert, setUploadedFiles, userDetails, handleDrawerOpen, handleDrawerClose, handleSetTitle, handleSetUserDetails, handleSetUserPermissions, handleSetTheme, handleToogleSettingDrawer, handleResetTheme, handleSetTimeIn, handleSetCompanyLogo, companyLogo } = commonReducersSlice.actions;

export default commonReducersSlice.reducer;
