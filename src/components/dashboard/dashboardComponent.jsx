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


// import React, { useEffect, useState } from 'react'
// import { addUserTimeIn, getDashboardData, getUserLastInOut, updateUserTimeIn } from '../../service/userInOut/userInOut';
// import { useForm } from 'react-hook-form';
// import { useLocation, useNavigate } from 'react-router-dom';
// import AlertDialog from '../common/alertDialog/alertDialog';
// import Button from '../common/buttons/button';
// import { connect } from 'react-redux';
// import { handleSetTimeIn, handleSetTitle } from '../../redux/commonReducers/commonReducers';
// import { useTheme } from '@mui/material';

// const DashboardComponent = ({ handleSetTitle, handleSetTimeIn, timeIn }) => {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const theme = useTheme();

//   const userInfo = JSON.parse(localStorage.getItem("userInfo"))
//   const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' })
//   const [timer, setTimer] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);

//   const [data, setData] = useState(null)

//   const {
//     setValue,
//   } = useForm({
//     defaultValues: {
//       id: '',
//       timeIn: '',
//       timeOut: ''
//     },
//   });

//   const handleOpenDialog = () => {
//     setDialog({
//       open: true,
//       title: "Clock Out",
//       message: "Are you sure! Do you want to clock out?",
//       actionButtonText: "Yes",
//     })
//   }

//   const handleCloseDialog = () => {
//     setDialog({
//       open: false,
//       title: "",
//       message: "",
//       actionButtonText: "",
//     })
//   }

//   const handleStart = async () => {
//     if (!isRunning) {
//       // const date1 = new Date();
//       const response = await addUserTimeIn(sessionStorage.getItem("locationId") !== undefined && sessionStorage.getItem("locationId") !== null ? sessionStorage.getItem("locationId") : "", userInfo?.companyId);
//       if (response.data?.status === 201) {
//         setIsRunning(true);
//         setValue("id", response.data?.result?.id);
//         setTimer(0)
//         localStorage.setItem("timeIn", "true")
//         handleSetTimeIn(true)
//       }
//     }
//   };

//   const handleStop = async () => {
//     if (isRunning) {
//       setIsRunning(false);
//       const response = await updateUserTimeIn(userInfo?.employeeId);
//       if (response.data.status === 200) {
//         handleCloseDialog()
//         setTimer(0);
//         setValue("id", null);
//         localStorage.removeItem("timeIn")
//         handleSetTimeIn(false)
//         // handleGetTodayInOutRecords();
//         if (location.pathname.endsWith("/dashboard/main")) {
//           navigate("/dashboard/main")
//         }
//       }
//     }
//   };

//   const formatTime = (seconds) => {
//     const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
//     const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
//     const secs = (seconds % 60).toString().padStart(2, '0');
//     return `${hrs}:${mins}:${secs}`;
//   };

//   // const handleGetTimeDifference = () => {
//   //   if (localStorage.getItem("timeIn")) {
//   //     const date1 = new Date();
//   //     const date2 = new Date(localStorage.getItem("timeIn"));
//   //     const diffInSeconds = Math.round((date1 - date2) / 1000);
//   //     setTimer(diffInSeconds);
//   //     setIsRunning(true)
//   //   }
//   // }

//   const handleGetDashboardData = async () => {
//     if (userInfo?.companyId) {
//       const res = await getDashboardData(userInfo?.companyId)
//       setData(res.data.result)
//     }
//   }

//   const parseUTCToLocal = (s) => {
//     if (!s) return null;

//     const [datePart, timePartRaw] = s.split(",").map(t => t.trim());
//     const [dd, mm, yyyy] = datePart.split("/").map(Number);

//     const [timePart, ampm] = timePartRaw.split(" ");
//     let [hh, min, ss] = timePart.split(":").map(Number);

//     if (ampm === "PM" && hh < 12) hh += 12;
//     if (ampm === "AM" && hh === 12) hh = 0;

//     // 👇 treat as UTC explicitly
//     return new Date(Date.UTC(yyyy, mm - 1, dd, hh, min, ss));
//   };

//   const handleGetUserLastInOut = async () => {
//     if (userInfo?.employeeId) {
//       const res = await getUserLastInOut(userInfo?.employeeId);

//       if (res.data.result) {
//         const date1 = new Date();
//         const date2 = parseUTCToLocal(res.data.result.timeIn);

//         if (!date2 || Number.isNaN(date2.getTime())) {
//           setTimer(0);
//           setIsRunning(false);
//           return;
//         }

//         const diffInSeconds = Math.max(0, Math.floor((date1.getTime() - date2.getTime()) / 1000));

//         setTimer(diffInSeconds);
//         setIsRunning(true);
//       } else {
//         setTimer(0);
//         setIsRunning(false);
//         setValue("id", null);
//       }
//     }
//   };

//   useEffect(() => {
//     handleSetTitle("Dashboard")
//     handleGetUserLastInOut()
//     handleGetDashboardData()
//     // handleGetTodayInOutRecords()
//   }, [])

//   useEffect(() => {
//     let intervalId;
//     if (isRunning) {
//       intervalId = setInterval(() => {
//         setTimer(prevTime => {
//           const updatedTime = prevTime + 1;
//           return updatedTime;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(intervalId);
//   }, [isRunning]);

//   // useEffect(() => {
//   //   handleGetUserLastInOut()
//   // }, [timeIn])

//   return (
//     <div className='px-4 lg:px-0'>
//       <div className='border rounded-lg bg-white h-[570px] lg:w-full'>

//         <div className='flex justify-end items-center gap-3 my-3'>
//           {
//             parseInt(localStorage.getItem("timeInAllow")) === 1 && (
//               <>
//                 <div style={{ color: theme.palette.primary.text.main }} className="text-xl font-bold text-end">{formatTime(timer)}</div>
//                 <div className="flex justify-end gap-4 mr-3">
//                   <Button text={isRunning ? "Clock Out" : "Clock In"} useFor={isRunning ? "error" : "success"} onClick={!isRunning ? handleStart : handleOpenDialog} />
//                 </div>
//               </>
//             )
//           }
//         </div>

//         <div className='xl:flex justify-center items-center gap-3 xl:gap-7'>
//           <div className='grid grid-cols-2 xl:grid-cols-8 gap-3 px-3 xl:px-0'>
//             <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
//               <div className='text-center'>
//                 <p className='md:text-2xl font-bold'>Today's Punch-In</p>
//                 <p className='md:text-xl font-bold mt-2'>{data?.countCheckedInUsers || 0}</p>
//               </div>
//             </div>

//             <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
//               <div className='text-center'>
//                 <p className='md:text-2xl font-bold'>Total Employees</p>
//                 <p className='md:text-xl font-bold mt-2'>{data?.companyTotalUserCount || 0}</p>
//               </div>
//             </div>

//             <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
//               <div className='text-center'>
//                 <p className='md:text-2xl font-bold'>Active Users Today</p>
//                 <p className='md:text-xl font-bold mt-2'>{data?.currentInUserCount || 0}</p>
//               </div>
//             </div>

//             <div style={{ color: theme.palette.primary.text.main }} className='border-2 rounded-md xl:w-96 h-44 xl:col-span-4 flex justify-center items-center'>
//               <div className='text-center'>
//                 <p className='md:text-2xl font-bold'>Today's Punch-Out</p>
//                 <p className='md:text-xl font-bold mt-2'>{data?.countCheckedOutUsers || 0}</p>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//       <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleStop} handleClose={handleCloseDialog} />
//     </div>
//   )
// }

// const mapStateToProps = (state) => ({
//   timeIn: state.common.timeIn,
// });

// const mapDispatchToProps = {
//   handleSetTitle,
//   handleSetTimeIn
// };

// export default connect(mapStateToProps, mapDispatchToProps)(DashboardComponent)
