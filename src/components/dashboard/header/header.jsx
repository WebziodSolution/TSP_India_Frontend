import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { ReactComponent as User } from "../../../assets/svgs/user-alt.svg";

import Components from '../../muiComponents/components';
import { handleDrawerOpen, handleToogleSettingDrawer, handleResetTheme, handleSetTimeIn, setLoading, handleSetUserDetails, handleSetCompanyLogo } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import AlertDialog from '../../common/alertDialog/alertDialog';
import { getTodayInOutRecords } from '../../../service/userInOut/userInOut'; // Removed direct add/update calls
import Menu from '../../common/menu/Menu';
import Button from '../../common/buttons/button';
import Divider from '../../common/divider/divider';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomIcons from '../../common/icons/CustomIcons';
import { useTheme } from '@mui/material';
import { getCompanyDetails } from '../../../service/companyDetails/companyDetailsService';
import { getAccurateLocation } from '../../../service/common/radarService';
import { radarPKAPIKey } from '../../../config/apiConfig/apiConfig';
import { getLocations } from '../../../service/location/locationService';

// IMPORT YOUR CLOCK CONTEXT
// Adjust the path below to where you saved ClockProvider.jsx
import { useClock, formatTimeHHMMSS } from '../../../context/ClockProvider';

const parseDDMMYYYYTime = (s) => {
    if (!s) return null;
    const [datePart, timePartRaw] = s.split(",").map(t => t.trim());
    if (!datePart || !timePartRaw) return null;
    const [dd, mm, yyyy] = datePart.split("/").map(Number);
    const [timePart, ampm] = timePartRaw.split(" ");
    let [hh, min, ss] = timePart.split(":").map(Number);
    if (ampm === "PM" && hh < 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
    return new Date(yyyy, mm - 1, dd, hh, min, ss);
};

const Header = ({ handleSetCompanyLogo, companyLogo, userDetails, handleSetUserDetails, setLoading, handleDrawerOpen, drawerWidth, handleToogleSettingDrawer, handleResetTheme, handleSetTimeIn, timeIn, title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const geoCheckInFlight = useRef(false);
    const intervalRef = useRef(null);

    // Get Clock Logic from Context
    const { isRunning, elapsedSec, clockIn, clockOut } = useClock();

    let userInfo = userDetails || JSON.parse(localStorage.getItem("userInfo"));
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [logOutDialog, setLogOutDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [userTimeRecords, setUserTimeRecords] = useState([]);

    const open = Boolean(anchorEl);
    const openProfile = Boolean(profileAnchorEl);

    // Sync Context state with Redux to ensure global consistency
    useEffect(() => {
        handleSetTimeIn(isRunning);
        if (!isRunning) {
            handleGetTodayInOutRecords(); // Refresh table when clock stops
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        // Refresh records when opening the menu
        handleGetTodayInOutRecords();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickProfile = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleCloseProfile = () => {
        setProfileAnchorEl(null);
    };

    const handleOpenDialog = () => {
        setDialog({
            open: true,
            title: "Clock Out",
            message: "Are you sure! Do you want to clock out?",
            actionButtonText: "Yes",
        });
    };

    const handleCloseDialog = () => {
        setDialog({
            open: false,
            title: "",
            message: "",
            actionButtonText: "",
        });
    };

    const formatDuration = (timeIn, timeOut) => {
        if (!timeOut) return;

        const diff = new Date(timeOut) - new Date(timeIn);
        if (diff <= 0) return "0 sec";

        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        let result = [];

        if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
        if (hours > 0) result.push(`${hours} hr${hours > 1 ? "s" : ""}`);
        if (minutes > 0) result.push(`${minutes} min${minutes > 1 ? "s" : ""}`);

        return result.join(" ");
    };

    const handleStart = async () => {
        await clockIn();
    };

    const handleStop = async () => {
        await clockOut();
        handleCloseDialog();

        // Navigation logic after stopping
        if (location.pathname.endsWith("/dashboard/timecard")) {
            navigate("/dashboard/timecard");
        }
    };

    const handleGetTodayInOutRecords = async () => {
        const response = await getTodayInOutRecords();
        setUserTimeRecords(response?.data?.result);
    };

    const handleOpenLogoutDialog = () => {
        setLogOutDialog({ open: true, title: "Logout", message: "Are you sure! Do you want to logout?", actionButtonText: "Logout" });
    };

    const handleLogout = () => {
        handleResetTheme();
        Cookies.remove('authToken');
        localStorage.removeItem('theme');
        localStorage.removeItem('authToken');
        localStorage.removeItem('permissions');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('timeInAllow');
        setLogOutDialog({ open: false, title: "", message: "", actionButtonText: "" });
        navigate("/signin");
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    const handleGetCompany = async () => {
        if (userInfo?.companyId) {
            const response = await getCompanyDetails(userInfo?.companyId);
            if (response.data.status === 200) {
                handleSetCompanyLogo(response.data?.result?.companyLogo);
            }
        }
    };

    const checkGeofenceStatus = async () => {
        if (geoCheckInFlight.current) return;
        geoCheckInFlight.current = true;

        try {
            if (
                !(
                    userInfo?.companyId &&
                    userInfo?.checkGeofence === 1 &&
                    userInfo?.roleName !== "Admin" &&
                    userInfo?.roleName !== "Owner"
                )
            ) {
                localStorage.setItem("timeInAllow", 1);
                return;
            }

            // Don't show loading spinner on every background check, only maybe initial
            // setLoading(true); 

            const locations = await getLocations(JSON.parse(userInfo?.companyLocation));
            if (locations?.data?.status !== 200) {
                console.error("Failed to fetch locations:", locations?.data?.message);
                return;
            }

            const allowedExternalIds =
                locations?.data?.result?.map((item) => ({
                    externalId: item.externalId,
                    locationId: item.id,
                })) || [];

            const loc = await getAccurateLocation();

            if (!window.Radar) {
                console.error("Radar SDK not loaded.");
                return;
            }

            if (!loc?.latitude || !loc?.longitude) {
                console.error("Location data not available.");
                return;
            }

            const { latitude, longitude, accuracy } = loc;
            const formattedLatitude = parseFloat(Number(latitude).toFixed(5));
            const formattedLongitude = parseFloat(Number(longitude).toFixed(5));

            window.Radar.initialize(radarPKAPIKey);
            window.Radar.setUserId(`timesheetspro_user_${userInfo?.employeeId}`);

            const matched = await new Promise((resolve) => {
                window.Radar.trackOnce(
                    {
                        latitude: formattedLatitude,
                        longitude: formattedLongitude,
                        accuracy: Math.min(accuracy || 0, 30),
                    },
                    (status, radarLocation, user, events) => {
                        const geofences = [
                            ...(user?.user?.geofences || []),
                            ...(events?.map((e) => e?.geofence).filter(Boolean) || []),
                        ];

                        for (const g of geofences) {
                            const geofenceExternalId = g?.externalId;
                            const matchedLocation = allowedExternalIds.find(
                                (x) => x.externalId === geofenceExternalId
                            );

                            if (matchedLocation?.locationId !== undefined) {
                                resolve(true);
                                return;
                            }
                        }
                        resolve(false);
                    }
                );
            });

            localStorage.setItem("timeInAllow", matched ? 1 : 0);

            if (matched && intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        } catch (error) {
            console.error("Error checking geofence status:", error);
        } finally {
            geoCheckInFlight.current = false;
            // setLoading(false);
        }
    };

    const handleCloseLogoutModel = () => {
        setLogOutDialog({ open: false, title: "", message: "", actionButtonText: "" })
    }

    useEffect(() => {
        const stored = localStorage.getItem("userInfo");
        const parsedUser = stored ? JSON.parse(stored) : null;

        if (parsedUser) {
            handleSetUserDetails(parsedUser);
        }

        handleGetTodayInOutRecords();
        handleGetCompany();

        // First immediate check
        checkGeofenceStatus();

        // Repeat every 60 sec
        intervalRef.current = setInterval(() => {
            checkGeofenceStatus();
        }, 60000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Components.AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    background: theme.palette.primary.background.headerBgColor || 'white',
                    boxShadow: 0,
                    transition: 'width 0.3s ease-in-out',
                    borderBottom: `1px solid ${theme.palette.primary.background.headerBgColor}`,
                }}
            >
                <Components.Toolbar sx={{ display: 'block', paddingY: 0.5 }}>
                    <Components.Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingY: '0px',
                            width: '100%',
                            gap: { xs: 0, sm: 4 }
                        }}
                    >
                        <Components.IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            sx={{ mr: 0, display: { md: 'none' } }}
                            onClick={handleDrawerOpen}
                        >
                            <CustomIcons iconName={'fa-solid fa-list'} css='text-[#262b43] cursor-pointer' />
                        </Components.IconButton>

                        <Components.Box sx={{ flexGrow: 1 }}>
                            <div className="flex justify-start items-center gap-3">
                                {
                                    <div className='w-12 h-12 rounded-full'>
                                        {companyLogo ? (
                                            <img
                                                src={companyLogo}
                                                alt="Preview"
                                                className="h-full w-full object-cover border rounded-full"
                                            />
                                        ) :
                                            <div className='mt-2'>
                                                <User height={30} width={30} fill="#CED4DA" />
                                            </div>
                                        }
                                    </div>
                                }
                                <div>
                                    <p style={{ color: theme.palette.primary.text.main, fontWeight: "bold", fontSize: 20 }}>
                                        {title}
                                    </p>
                                </div>
                            </div>
                        </Components.Box>

                        <Components.Box sx={{ display: 'flex', gap: 2 }}>
                            <Components.Box sx={{ display: 'flex', gap: 2, padding: 1, alignItems: "center" }}>
                                {
                                    (userInfo?.employeeId && userInfo?.companyId) && (
                                        <Components.Box onClick={handleClick}>
                                            <CustomIcons iconName={"fa-regular fa-clock"} css='cursor-pointer text-2xl mt-2 text-black' />
                                        </Components.Box>
                                    )
                                }
                                <Components.Box onClick={handleClickProfile}>
                                    <Components.Avatar
                                        alt={userInfo?.firstName + " " + userInfo?.lastName}
                                        src={userInfo?.profileImage}
                                        sx={{
                                            backgroundColor: userInfo?.profileImage ? "" : "#0093E9",
                                            border: "1px solid #cfd0d6",
                                            color: "white",
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {!userInfo?.profileImage && getInitials(userInfo?.firstName, userInfo?.lastName)}
                                    </Components.Avatar>
                                </Components.Box>
                            </Components.Box>
                        </Components.Box>
                    </Components.Box>
                </Components.Toolbar>
            </Components.AppBar>

            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleStop} handleClose={handleCloseDialog} />
            <AlertDialog open={logOutDialog.open} title={logOutDialog.title} message={logOutDialog.message} actionButtonText={logOutDialog.actionButtonText} handleAction={handleLogout} handleClose={handleCloseLogoutModel} />

            <Menu
                id="demo-customized-menu"
                MenuListProps={{
                    'aria-labelledby': 'demo-customized-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                width={360}
            >
                <div className="flex flex-col items-center gap-4 p-5">
                    {/* Updated to use Context elapsedSec */}
                    <div className="text-xl font-bold">{formatTimeHHMMSS(elapsedSec)}</div>

                    {
                        parseInt(localStorage.getItem("timeInAllow")) === 1 && (
                            <div className="flex justify-center gap-4">
                                <button
                                    className={`px-4 py-2 text-white rounded ${isRunning || parseInt(localStorage.getItem("timeInAllow")) === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 cursor-pointer'}`}
                                    onClick={handleStart}
                                    disabled={parseInt(localStorage.getItem("timeInAllow")) === 0 || isRunning}
                                >
                                    Clock In
                                </button>
                                <button
                                    className={`px-4 py-2 text-white rounded ${!isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500'}`}
                                    onClick={handleOpenDialog}
                                    disabled={!isRunning}
                                >
                                    Clock Out
                                </button>
                            </div>
                        )
                    }

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-300 text-left">
                                <th className="p-2">#</th>
                                <th className="p-2">Clock In</th>
                                <th className="p-2">Clock Out</th>
                                <th className="p-2">Total Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userTimeRecords?.map((entry, index) => {
                                const parsedTimeIn = entry.timeIn ? parseDDMMYYYYTime(entry.timeIn) : null;
                                const parsedTimeOut = entry.timeOut ? parseDDMMYYYYTime(entry.timeOut) : null;
                                
                                return (
                                    <tr key={index} className="border-b border-gray-200">
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2">
                                            {parsedTimeIn ? (
                                                <div>
                                                    {parsedTimeIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </div>
                                            ) : <span>-</span>}
                                        </td>
                                        <td className="p-2">
                                            {parsedTimeOut ? (
                                                <div>
                                                    {parsedTimeOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </div>
                                            ) : <span>-</span>}
                                        </td>
                                        <td className="p-2">{formatDuration(parsedTimeIn, parsedTimeOut) || "-"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Menu>

            <Menu
                id="demo-customized-menu"
                anchorEl={profileAnchorEl}
                open={openProfile}
                onClose={handleCloseProfile}
                width={200}
            >
                <div className='text-center p-3 hover:bg-gray-50 cursor-pointer'>
                    <div className='flex justify-start gap-3 items-center'>
                        <Components.Avatar
                            alt={userInfo?.firstName + " " + userInfo?.lastName}
                            src={userInfo?.profileImage}
                            sx={{
                                backgroundColor: userInfo?.profileImage ? "" : "#0093E9",
                                border: "1px solid #cfd0d6",
                                color: "white",
                                fontSize: "16px",
                                fontWeight: "bold",
                            }}
                        >
                            {!userInfo?.profileImage && getInitials(userInfo?.firstName, userInfo?.lastName)}
                        </Components.Avatar>

                        <p className='text-sm text-start font-semibold'>
                            {userInfo?.firstName} {userInfo?.lastName}<br />
                            <span>
                                {userInfo?.roleName}
                            </span>
                        </p>
                    </div>
                </div>
                <Divider />
                <div className='px-3 py-1'>
                    <Button useFor="error" endIcon={<CustomIcons iconName="fa-solid fa-arrow-right-from-bracket" />} text="Logout" onClick={handleOpenLogoutDialog}></Button>
                </div>
            </Menu>
        </>
    );
};

const mapDispatchToProps = {
    handleDrawerOpen,
    handleToogleSettingDrawer,
    handleResetTheme,
    handleSetTimeIn,
    setLoading,
    handleSetUserDetails,
    handleSetCompanyLogo
};

const mapStateToProps = (state) => ({
    drawerOpen: state.common.drawerOpen,
    timeIn: state.common.timeIn,
    title: state.common.title,
    userDetails: state.common.userDetails,
    companyLogo: state.common.companyLogo,
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);