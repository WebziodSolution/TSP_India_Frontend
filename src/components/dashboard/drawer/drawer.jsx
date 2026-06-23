import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import Components from '../../muiComponents/components';
import { connect } from 'react-redux';
import { handleDrawerClose, handleSetTitle } from '../../../redux/commonReducers/commonReducers';
import { useTheme, useMediaQuery } from '@mui/material';
import CustomIcons from '../../common/icons/CustomIcons';
import { isNative } from '../../../utils/platform';

const DrawerMenu = ({ title, handleSetTitle, handleDrawerClose, drawerWidth, setDrawerWidth, setIsDrawerOpen, drawerOpen, props = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md ~ 960px
  const { window } = props;
  const [openChild, setOpenChild] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  const [items, setItems] = useState([])

  const mapPermissionsToItems = () => {
    const permissionsData = JSON.parse(localStorage.getItem("permissions")) || [];
    const data = [];

    permissionsData?.forEach((functionality) => {
      const { functionalityName, modules } = functionality;

      const filteredModules = modules.filter(module => {
        return module.roleAssignedActions.some(action =>
          module.moduleAssignedActions.includes(action)
        );
      });

      if (userInfo?.employeeId && userInfo?.companyId) {
        data.push(
          {
            name: "Dashboard",
            icon: <CustomIcons iconName={'fa-solid fa-house'} css='cursor-pointer' />,
          },
          (
            !isNative() && (
              {
                name: "Time Card",
                icon: <CustomIcons iconName={'fa-solid fa-clock'} css='cursor-pointer' />
              }
            )
          )
        )
      }

      if (!isNative()) {
        if (functionalityName === "Company") {
          if (filteredModules.length > 0) {
            const permissionsChildren = filteredModules?.map((module) => ({
              name: module.moduleName,
              icon: <CustomIcons iconName={'fa-solid fa-circle'} css='cursor-pointer' />
            }));

            permissionsChildren?.map((item, index) => {
              if (item.name === "Manage Company") {
                data.push({
                  name: "Manage Company",
                  icon: <CustomIcons iconName={'fa-solid fa-building'} css='cursor-pointer' />
                })
              }
              if (item.name === "Manage Employees") {
                data.push({
                  name: "Manage Employees",
                  icon: <CustomIcons iconName={'fa-solid fa-users'} css='cursor-pointer' />
                })
              }
              if (item.name === "Manage Shifts") {
                data.push({
                  name: "Manage Shifts",
                  icon: <CustomIcons iconName={'fa-solid fa-clock'} css='cursor-pointer' />
                })
              }
            })
          }
        }
        else if (functionalityName === "Users") {
          if (!userInfo?.companyId && !userInfo?.employeeId) {
            data.push({
              name: "Peoples",
              icon: <CustomIcons iconName={'fa-solid fa-users'} css=' cursor-pointer' />,
              child: [{ name: "Manage User", icon: <CustomIcons iconName={'fa-solid fa-circle'} css=' cursor-pointer' /> }],
            });
          }
        }
        else if (functionalityName === "Permission") {
          if (filteredModules.length > 0) {
            const permissionsChildren = filteredModules
              .filter((module) => (module?.moduleName !== "Contractor" && module?.moduleName !== "Functionality" && module?.moduleName !== "Module" && module?.moduleName !== "Salary Statement"))
              .map((module) => ({
                name: module.moduleName,
                icon: <CustomIcons iconName={'fa-solid fa-circle'} css=' cursor-pointer' />,
              }));

            if (userInfo?.companyId && userInfo?.employeeId) {
              data.push({
                name: "Reports",
                icon: <CustomIcons iconName={'fa-solid fa-file'} css='cursor-pointer' />,
                child: [
                  { name: "PF Report", icon: <CustomIcons iconName={'fa-solid fa-circle'} css='cursor-pointer' /> },
                  { name: "PT Report", icon: <CustomIcons iconName={'fa-solid fa-circle'} css='cursor-pointer' /> },
                  { name: "Generate Salary", icon: <CustomIcons iconName={'fa-solid fa-circle'} css='cursor-pointer' /> },
                  { name: "Salary Report", icon: <CustomIcons iconName={'fa-solid fa-circle'} css='cursor-pointer' /> },
                  { name: "GrossSalaryReport", icon: <CustomIcons iconName={'fa-solid fa-circle'} css='cursor-pointer' /> },
                ]
              });
            }

            data.push({
              name: "Permissions",
              icon: <CustomIcons iconName={'fa-solid fa-key'} css=' cursor-pointer' />,
              child: permissionsChildren,
            });

          }
        }
      }
    });

    const uniqueData = data?.filter(
      (item, index, self) => index === self.findIndex((t) => t.name === item.name)
    );

    setItems((prev) => uniqueData);
    setItems((prev) => {
      const newItems = [...prev];
      newItems.push({
        name: "Settings",
        icon: <CustomIcons iconName={'fa-solid fa-gear'} css=' cursor-pointer' />,
        child: [
          { name: "Profile", icon: <CustomIcons iconName={'fa-solid fa-circle'} css=' cursor-pointer' /> },
          { name: "Automation Rules", icon: <CustomIcons iconName={'fa-solid fa-circle'} css=' cursor-pointer' /> },
          // ((userInfo?.roleName === "Admin" || userInfo?.roleName === "Owner") && userInfo?.companyId) &&
          // { name: "Company Theme", icon: <CustomIcons iconName={'fa-solid fa-circle'} css=' cursor-pointer' /> },
        ].filter(Boolean)
      });
      return newItems;
    });

  };

  const handleToggleChild = (name, index) => {
    // setSelectedNavItem(name)
    setOpenChild((prevOpenChild) => (prevOpenChild === index ? null : index));
  };

  const container = window !== undefined ? () => window().document.body : undefined;

  const handleChangeDrawer = () => {
    if (drawerWidth === 260) {
      setDrawerWidth(65)
    } else {
      setDrawerWidth(260)
    }
    setIsDrawerOpen((prev) => !prev)
  }

  const drawer = (
    <div className='mx-1'>
      <div
        style={{ color: theme.palette.primary.text.main }}
        className="flex justify-between items-center text-xl font-bold font-['Inter'] py-5 px-2 transition-all duration-300 ease-in-out"
      >
        <div className={`flex-1 text-center  transition-opacity duration-300 ${drawerWidth === 260 ? 'opacity-100' : 'opacity-0'}`}>
          {drawerWidth === 260 ? <p>Calculate Salary</p> : null}
        </div>

        <div className="hidden lg:flex items-center justify-center w-10 h-10">
          <Components.IconButton
            onClick={handleChangeDrawer}
            className="transition-transform duration-300 hover:scale-110"
          >
            {drawerWidth === 260 ? (
              <CustomIcons iconName={'fa-solid fa-angle-left'} css='h-5 w-5' />
            ) : (
              <CustomIcons iconName={'fa-solid fa-angle-right'} css='h-5- w-5' />
            )}
          </Components.IconButton>
        </div>
      </div>

      <Components.List>
        {
          items?.map((item, index) => (
            <React.Fragment key={index}>
              <Components.ListItem disablePadding className='h-12' sx={{ borderRadius: '8px', transition: 'all 0.2s ease', background: (title === item.name || (item.name === "Manage Employees" && (title === "Add Employee" || title === "Update Employee")) || (item.name === "PF Report" && title === "PF Report") || (item.name === "PT Report" && title === "PT Report")) ? theme.palette.primary.main : '', color: (title === item.name || (item.name === "Manage Employees" && (title === "Add Employee" || title === "Update Employee") || (item.name === "PF Report" && title === "PF Report") || (item.name === "PT Report" && title === "PT Report"))) ? "white" : '', '& .MuiListItemButton-root:hover': { background: (title === item.name || (item.name === "Manage Employees" && (title === "Add Employee" || title === "Update Employee") || (item.name === "PF Report" && title === "PF Report") || (item.name === "PT Report" && title === "PT Report"))) ? theme.palette.primary.main : '', color: (title === item.name || (item.name === "Manage Employees" && (title === "Add Employee" || title === "Update Employee") || (item.name === "PF Report" && title === "PF Report") || (item.name === "PT Report" && title === "PT Report"))) ? 'white' : '', borderRadius: '8px' } }} >
                {
                  !item.child ? (
                    <NavLink className="w-full" to={`/dashboard/${item.name === "Dashboard" ? "main" : item?.name?.toLowerCase()?.split(' ').join('')}`} key={index} onClick={() => { handleSetTitle(item.name === "Manage User" ? title : item.name); if (isMobile) handleDrawerClose() }}>
                      <Components.ListItemButton onClick={() => handleToggleChild(item.name, index)} >
                        <Components.ListItemIcon sx={{ color: (title === item.name || (item.name === "Manage Employees" && (title === "Add Employee" || title === "Update Employee")) || (item.name === "PF Report" && title === "PF Report") || (item.name === "PT Report" && title === "PT Report")) ? "white" : '' }}>
                          {item.icon}
                        </Components.ListItemIcon>
                        <Components.ListItemText primary={item.name} sx={{ textTransform: "capitalize" }} />
                        {
                          item.child?.length > 0 ? (
                            <>
                              {openChild === index ? (
                                <CustomIcons iconName={'fa-solid fa-angle-down'} css=' cursor-pointer' />
                              ) : (
                                <CustomIcons iconName={'fa-solid fa-angle-right'} css=' cursor-pointer' />
                              )}
                            </>
                          ) : null

                        }
                      </Components.ListItemButton>
                    </NavLink>
                  ) :
                    <Components.ListItemButton sx={{ backgroundColor: openChild === index ? "#E7E7EA" : "", borderRadius: '8px', transition: 'all 0.2s ease', '& .MuiListItemButton-gutters:hover': { background: openChild === index ? "#E7E7EA" : "" }, height: 45 }} onClick={() => handleToggleChild(item.name, index)} >
                      <Components.ListItemIcon sx={{ color: title === item.name ? "white" : '' }}>
                        {item.icon}
                      </Components.ListItemIcon>
                      <Components.ListItemText primary={item.name} sx={{ textTransform: "capitalize" }} />
                      {
                        item.child?.length > 0 ? (
                          <>
                            {openChild === index ? (
                              <CustomIcons iconName={'fa-solid fa-angle-down'} css=' cursor-pointer' />
                            ) : (
                              <CustomIcons iconName={'fa-solid fa-angle-right'} css=' cursor-pointer' />
                            )}
                          </>
                        ) : null

                      }
                    </Components.ListItemButton>
                }

              </Components.ListItem>
              {item?.child?.length > 0 && (
                <Components.Collapse in={openChild === index} timeout="auto" unmountOnExit style={{ marginTop: 2 }}>
                  <Components.List component="div" disablePadding>
                    {item.child?.map((row, rowIndex) => (
                      <NavLink to={`/dashboard/${row?.name?.toLowerCase().replace(" ", "")}`} key={rowIndex} onClick={() => { handleSetTitle(row?.name === "Manage User" ? title : row?.name); if (isMobile) handleDrawerClose() }}>
                        <Components.ListItem disablePadding sx={{ borderRadius: '8px', transition: 'all 0.2s ease', background: (((title === "Manage User" || title === "Add User" || title === "Update User") && row.name === "Manage User") || (title === row.name)) ? theme.palette.primary.main : '', color: (((title === "Manage User" || title === "Add User" || title === "Update User") && row.name === "Manage User") || (title === row.name)) ? "white" : '', '& .MuiListItemButton-root:hover': { background: (((title === "Manage User" || title === "Add User" || title === "Update User") && row.name === "Manage User") || (title === row.name)) ? theme.palette.primary.main : '', color: (((title === "Manage User" || title === "Add User" || title === "Update User") && row.name === "Manage User") || (title === row.name)) ? 'white' : '', borderRadius: '8px' } }}>
                          <Components.ListItemButton>
                            <Components.ListItemIcon sx={{ color: (((title === "Manage User" || title === "Add User" || title === "Update User") && row.name === "Manage User") || (title === row.name)) ? "white" : '' }}>
                              {React.cloneElement(row.icon)}
                            </Components.ListItemIcon>
                            <Components.ListItemText primary={row.name} sx={{ textTransform: "capitalize" }} />
                          </Components.ListItemButton>
                        </Components.ListItem>
                      </NavLink>
                    ))}
                  </Components.List>
                </Components.Collapse>
              )}
            </React.Fragment>
          ))
        }
      </Components.List>
    </div>
  );

  useEffect(() => {
    mapPermissionsToItems()
  }, [])

  return (
    <>
      <Components.Drawer
        container={container}
        variant="temporary"
        open={drawerOpen}
        // onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: 'width 0.3s ease-in-out', // smooth transition
            overflowX: 'hidden',
          }
        }}
      >
        {drawer}
      </Components.Drawer>

      <Components.Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
            background: theme.palette.primary.background.sideNavigationBgColor
          }
        }}
        open
      >
        {drawer}
      </Components.Drawer>
    </>
  )
}

DrawerMenu.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

const mapStateToProps = (state) => ({
  drawerOpen: state.common.drawerOpen,
  title: state.common.title,
});

const mapDispatchToProps = {
  handleDrawerClose,
  handleSetTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerMenu)