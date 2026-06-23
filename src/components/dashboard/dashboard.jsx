import React, { useEffect, useState } from 'react';
import Components from '../muiComponents/components';
import DrawerMenu from './drawer/drawer';
import Header from './header/header';
import { Outlet } from 'react-router-dom';
import { connect } from 'react-redux';
import { useTheme } from '@mui/material';
import { ClockProvider } from '../../context/ClockProvider';
import { handleSetTimeIn } from '../../redux/commonReducers/commonReducers';

function Dashboard({ title, handleSetTimeIn }) {
  const theme = useTheme();
  const [drawerWidth, setDrawerWidth] = useState(260);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    document.title = "Dashboard - Calculate Salary";
  }, []);

  return (
    <ClockProvider onStatusChange={(v) => handleSetTimeIn(v)}>
      <div style={{ background: theme.palette.primary.background.contentBgColor }} className="flex w-screen lg:w-full lg:overflow-x-hidden">
        <Header drawerWidth={drawerWidth} />

        <Components.Box
          component="nav"
          sx={{
            width: { md: isDrawerOpen ? drawerWidth : '65px' },
            flexShrink: 0,
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <DrawerMenu
            drawerWidth={drawerWidth}
            setDrawerWidth={setDrawerWidth}
            setIsDrawerOpen={setIsDrawerOpen}
          />
        </Components.Box>

        <Components.Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${isDrawerOpen ? drawerWidth : 65}px)` },
            transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
            overflowX: 'auto',
            paddingTop: '80px',
            paddingBottom: '15px',
          }}
        >

          <div className="lg:px-4">
            <Outlet />
          </div>
        </Components.Box>
      </div>
    </ClockProvider>
  );
}

const mapStateToProps = (state) => ({
  title: state.common.title
});

const mapDispatchToProps = {
  handleSetTimeIn
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
