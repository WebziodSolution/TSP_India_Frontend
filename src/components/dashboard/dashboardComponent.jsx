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

const DashboardComponent = ({ handleSetTitle, handleSetTimeIn, timeIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
  const [data, setData] = useState(null);

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
  };

  const handleStop = async () => {
    await clockOut();
    handleCloseDialog();

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

        <div className='xl:flex justify-center items-center gap-3 xl:gap-7'>
          <div className='grid grid-cols-2 xl:grid-cols-8 gap-3 px-3 xl:px-0'>
            <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Today's Punch-In</p>
                <p className='md:text-xl font-bold mt-2'>{data?.countCheckedInUsers || 0}</p>
              </div>
            </div>

            <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Total Employees</p>
                <p className='md:text-xl font-bold mt-2'>{data?.companyTotalUserCount || 0}</p>
              </div>
            </div>

            <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Active Users Today</p>
                <p className='md:text-xl font-bold mt-2'>{data?.currentInUserCount || 0}</p>
              </div>
            </div>

            <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
              <div className='text-center'>
                <p className='md:text-2xl font-bold'>Today's Punch-Out</p>
                <p className='md:text-xl font-bold mt-2'>{data?.countCheckedOutUsers || 0}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleStop} handleClose={handleCloseDialog} />
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