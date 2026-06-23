import { createTheme, ThemeProvider } from '@mui/material/styles';
import { connect } from 'react-redux';
import React, { useMemo } from 'react';

const generateMuiTheme = (theme) => createTheme({
  palette: {
    primary: {
      main: theme?.primaryColor || "#666cff",
      light: '#e6e6fe',
      text: {
        main: theme?.textColor || "#262b43",
        buttonText: theme?.textColor || "#ffffff",
        light: '#BEC0C7',
        contrastText: '#262b43',
      },
      icon: theme?.iconColor || '#262b43',
      background: {
        sideNavigationBgColor: theme?.sideNavigationBgColor || '',
        contentBgColor: theme?.contentBgColor || '',
        contentBgColor2: theme?.contentBgColor2 || '',
        headerBgColor: theme?.headerBgColor || '',
      }
    },
    secondary: {
      main: '#cfd0d6',
      light: '#BEC0C7',
      // contrastText: '#262b43',
    },
    text: {
      primary: '#262b43',
      secondary: '#666cff',
      // disabled: '#BEC0C7',
    },
    error: {
      main: '#FF4D66',
      // contrastText: '#ffffff',
    },
    warning: {
      main: '#ffed65',
      // contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
    },
    background: {
      default: '#F5F5F7',
      paper: '#ffffff',
    },
    table: {
      header: '#f5f5f7',
    },
    action: {
      hover: '#f5f5f7',
      selected: '#e6e6fe',
    },
  },
});

const MuiThemeProvider = ({ theme, children }) => {

  const muiTheme = useMemo(() => generateMuiTheme(theme), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      {children}
    </ThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  theme: state.common.theme,
});

export default connect(mapStateToProps)(MuiThemeProvider);