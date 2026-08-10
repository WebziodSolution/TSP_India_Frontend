import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../../service/userInOut/userInOut'; // Removed redundant imports
import { useLocation, useNavigate } from 'react-router-dom';
import AlertDialog from '../common/alertDialog/alertDialog';
import Button from '../common/buttons/button';
import { connect } from 'react-redux';
import { handleSetTimeIn, handleSetTitle } from '../../redux/commonReducers/commonReducers';
import { useTheme } from '@mui/material';

// IMPORT YOUR CLOCK CONTEXT
// Adjust the path below to where you saved ClockProvider.jsx
import { useClock, formatTimeHHMMSS } from '../../context/ClockProvider';
import Components from '../muiComponents/components';

const DashboardComponent = ({ handleSetTitle, handleSetTimeIn, timeIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
  const [data, setData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverUsers, setPopoverUsers] = useState([]);
  const [popoverTitle, setPopoverTitle] = useState('');

  // Consume Clock Context
  const { isRunning, elapsedSec, clockIn, clockOut } = useClock();

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

  // Sync Context state with Redux
  useEffect(() => {
    handleSetTimeIn(isRunning);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleStart = async () => {
    await clockIn();
    handleGetDashboardData()
  };

  const handleStop = async () => {
    await clockOut();
    handleCloseDialog();
    handleGetDashboardData()
    if (location.pathname.endsWith("/dashboard/main")) {
      navigate("/dashboard/main");
    }
  };

  const handleGetDashboardData = async () => {
    if (userInfo?.companyId) {
      const res = await getDashboardData(userInfo?.companyId);
      setData(res.data.result);
    }
  };

  useEffect(() => {
    document.title = "Dashboard - Calculate Salary";
    handleSetTitle("Dashboard");
    handleGetDashboardData();
    // No need to call getUserLastInOut here manually, the Provider handles hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = (event, title, users) => {
    if (users && users.length > 0) {
      setAnchorEl(event.currentTarget);
      setPopoverTitle(title);
      setPopoverUsers(users);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverUsers([]);
  };

  const openPopover = Boolean(anchorEl);

  return (
    <div className='px-4 lg:px-0'>
      <div className='border rounded-lg bg-white h-[570px] lg:w-full'>

        <div className='flex justify-end items-center gap-3 my-3'>
          {
            parseInt(localStorage.getItem("timeInAllow")) === 1 && (
              <>
                <div style={{ color: theme.palette.primary.text.main }} className="text-xl font-bold text-end">
                  {/* Use formatter from context */}
                  {formatTimeHHMMSS(elapsedSec)}
                </div>
                <div className="flex justify-end gap-4 mr-3">
                  <Button
                    text={isRunning ? "Clock Out" : "Clock In"}
                    useFor={isRunning ? "error" : "success"}
                    onClick={!isRunning ? handleStart : handleOpenDialog}
                  />
                </div>
              </>
            )
          }
        </div>

        <div className='flex justify-center items-center gap-3 p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl justify-items-center'>

            <div
              style={{ color: theme.palette.primary.text.main }}
              className="border-2 rounded-md w-full max-w-sm h-44 flex justify-center items-center transition-all cursor-pointer hover:bg-slate-50 hover:border-blue-400 shadow-sm hover:shadow-md"
              onClick={() => data?.countCheckedInUsers > 0 ? navigate('/dashboard/timecard', { state: { selectedTab: 1, filterToday: true } }) : null}
            >
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Today's Clock-In</p>
                <p className='md:text-xl font-bold mt-2'>{data?.countCheckedInUsers || 0}</p>
              </div>
            </div>

            <div
              style={{ color: theme.palette.primary.text.main }}
              className={`border-2 rounded-md w-full max-w-sm h-44 flex justify-center items-center transition-all ${data?.totalUserData?.length > 0 ? 'cursor-pointer hover:bg-slate-50 hover:border-blue-400 shadow-sm hover:shadow-md' : ''
                }`}
              onClick={(e) => handleCardClick(e, "Employee List", data?.totalUserData)}
            >
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Total Employees</p>
                <p className='md:text-xl font-bold mt-2'>{data?.companyTotalUserCount || 0}</p>
                {/* {data?.totalUserData?.length > 0 && (
                  <p className='text-xs text-blue-500 mt-1 font-medium'>Click to view users</p>
                )} */}
              </div>
            </div>

            <div
              style={{ color: theme.palette.primary.text.main }}
              className="border-2 rounded-md w-full max-w-sm h-44 flex justify-center items-center transition-all cursor-pointer hover:bg-slate-50 hover:border-blue-400 shadow-sm hover:shadow-md"
              onClick={() => data?.countCheckedOutUsers > 0 ? navigate('/dashboard/timecard', { state: { selectedTab: 1, filterToday: true } }) : null}
            >
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Today's Clock-Out</p>
                <p className='md:text-xl font-bold mt-2'>{data?.countCheckedOutUsers || 0}</p>
                {/* {data?.outUserData?.length > 0 && (
                  <p className='text-xs text-blue-500 mt-1 font-medium'>Click to view users</p>
                )} */}
              </div>
            </div>

          </div>
        </div>

      </div>
      <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleStop} handleClose={handleCloseDialog} />

      <Components.Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 3,
              minWidth: 220,
              borderRadius: 2,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
            }
          }
        }}
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-slate-500 mb-3 uppercase">
            {popoverTitle}
          </span>
          <ul className="list-disc list-inside space-y-2 text-slate-800 text-sm">
            {popoverUsers?.map((user, key) => (
              <li key={key} className="text-slate-700 font-medium list-item">
                {user.fullname}
              </li>
            ))}
          </ul>
        </div>
      </Components.Popover>
    </div>
  );
};

const mapStateToProps = (state) => ({
  timeIn: state.common.timeIn,
});

const mapDispatchToProps = {
  handleSetTitle,
  handleSetTimeIn
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardComponent);