import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import CustomIcons from '../../common/icons/CustomIcons';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';
import { Tabs } from '../../common/tabs/tabs';
import DataTable from '../../common/table/table';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/plugin/timezone'; // import the timezone data

import { deleteUserInOut, getAllEntriesByUserId, getAllRecordsGroupByUser } from '../../../service/userInOut/userInOut';
import { handleConvertUTCDateToLocalDate, handleFormateUTCDateToLocalDate } from '../../../service/common/commonService';
import { getAllEmployeeListByCompanyId } from '../../../service/companyEmployee/companyEmployeeService';
import { connect } from 'react-redux';
import { handleSetTitle, setAlert } from '../../../redux/commonReducers/commonReducers';
import Components from '../../muiComponents/components';
import PermissionWrapper from '../../common/permissionWrapper/PermissionWrapper';
import Button from '../../common/buttons/button';
import DetailedPDFTable from './timeCardPDF/detailedPDFTable';
import { getCompanyDetails } from '../../../service/companyDetails/companyDetailsService';
import Select from '../../common/select/select';
import SelectMultiple from '../../common/select/selectMultiple';
import { getAllDepartment } from '../../../service/department/departmentService';
import { AddClockInOut } from '../../models/clockInOut/addClockInOut';
import AlertDialog from '../../common/alertDialog/alertDialog';


const filterOptions = [
    { id: 1, title: 'January', value: 0 },
    { id: 2, title: 'February', value: 1 },
    { id: 3, title: 'March', value: 2 },
    { id: 4, title: 'April', value: 3 },
    { id: 5, title: 'May', value: 4 },
    { id: 6, title: 'June', value: 5 },
    { id: 7, title: 'July', value: 6 },
    { id: 8, title: 'August', value: 7 },
    { id: 9, title: 'September', value: 8 },
    { id: 10, title: 'October', value: 9 },
    { id: 11, title: 'November', value: 10 },
    { id: 12, title: 'December', value: 11 }
];

const tabData = [
    {
        label: 'User Summary',
    },
    {
        label: 'All Entries',
    },
]

const parseDDMMYYYY = (s) => {
    if (!s || typeof s !== "string") return null;

    const [dd, mm, yyyy] = s.split("/").map((v) => parseInt(v, 10));
    if (!dd || !mm || !yyyy) return null;

    const d = new Date(yyyy, mm - 1, dd);

    // validate (prevents 32/13/2026 etc)
    if (
        d.getFullYear() !== yyyy ||
        d.getMonth() !== mm - 1 ||
        d.getDate() !== dd
    ) return null;

    return d;
};

const TimeCard = ({ handleSetTitle, setAlert }) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"))

    const [selectedTab, setSelectedTab] = useState(0);
    const [loadingPdf, setLoadingPdf] = useState(false);

    const [users, setUsers] = useState([])

    const [rows, setRow] = useState([])
    const [companyInfo, setCompanyInfo] = useState()

    const [showPdfContent, setShowPdfContent] = useState(false);
    const [department, setDepartment] = useState([]);
    const [openInOutModel, setOpenInOutModel] = useState(false);
    const [clockInOutId, setClockInOutId] = useState(null);
    const [filter, setFilter] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [timeInOutId, setTimeInOutId] = useState(null)
    const [loading, setLoading] = useState(false);

    const {
        control,
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            startDate: (() => {
                const today = new Date();
                const day = "01";
                const month = (today.getMonth() + 1).toString().padStart(2, "0");
                const year = today.getFullYear();

                return `${day}/${month}/${year}`;
            })(),

            endDate: (() => {
                const today = new Date();
                const day = today.getDate().toString().padStart(2, "0");
                const month = (today.getMonth() + 1).toString().padStart(2, "0");
                const year = today.getFullYear();

                return `${day}/${month}/${year}`;
            })(),

            id: null,
            timeIn: null,
            timeOut: null,
            createdOn: null,
            userId: null,
            locationIds: [],
            selectedUserId: [],
            selectedDepartmentId: [],
        }
    });

    const handleOpenInOutModal = (id = null) => {
        setClockInOutId(id);
        setOpenInOutModel(true);
    }

    const handleCloseInOutModal = () => {
        setOpenInOutModel(false);
    }

    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    function convertToDesiredFormat(date) {
        // This function now expects a Date object, not an ISO string
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    }

    const handleGetAllUsers = async () => {
        if (((userInfo?.roleName === "Admin" || userInfo?.roleName === "Owner") && userInfo?.companyId)) {
            const response = await getAllEmployeeListByCompanyId(userInfo?.companyId)
            const data = response.data.result?.map((row) => {
                return {
                    id: row.employeeId,
                    title: row.userName
                }
            })
            setUsers(data)
            // setValue("selectedUserId", [parseInt(userInfo?.employeeId)])
        }
    }

    const handleGetCompanyInfo = async () => {
        if (userInfo?.companyId) {
            const response = await getCompanyDetails(userInfo?.companyId)
            setCompanyInfo(response?.data?.result)
        }
    }

    const handleGetAllDepartment = async () => {
        if (userInfo?.companyId) {
            const response = await getAllDepartment(userInfo?.companyId)
            if (response.data.status === 200) {
                const data = response.data?.result?.map((item) => {
                    return {
                        id: item?.id,
                        title: item?.departmentName,
                    }
                })
                setDepartment(data)
            }
        }
    }

    const setDates = () => {
        const selectedMonth = filter?.value;
        if (selectedMonth === null) {
            // setValue('startDate', null);
            // setValue('endDate', null);
            return;
        }
        const today = new Date();
        const currentMonth = today.getMonth();
        const year = today.getFullYear();

        const start = new Date(year, selectedMonth, 1);

        let end;
        if (selectedMonth === currentMonth) {
            end = today;
        } else {
            end = new Date(year, selectedMonth + 1, 0);
        }

        const formatDate = (date) => {
            return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${date.getFullYear()}`;
        };

        setValue('startDate', formatDate(start));
        setValue('endDate', formatDate(end));
    };

    const handleGetAllEntriesByUserId = async () => {
        let params = new URLSearchParams();
        let userIds = [];
        let locationIds = [];
        let departmentIds = [];

        if (
            userInfo?.roleName !== "Admin" &&
            userInfo?.roleName !== "Owner" &&
            userInfo?.companyId &&
            watch("selectedUserId").length === 0
        ) {
            params.append("userIds", [userInfo?.employeeId]);
        } else {
            if (watch("selectedUserId") && watch("selectedUserId").length > 0) {
                watch("selectedUserId").forEach((id) => userIds.push(id));
                params.append("userIds", userIds);
            }
        }

        if (watch("locationIds") && watch("locationIds").length > 0) {
            watch("locationIds").forEach((id) => locationIds.push(id));
            params.append("locationIds", locationIds);
        }

        if (watch("selectedDepartmentId") && watch("selectedDepartmentId").length > 0) {
            watch("selectedDepartmentId").forEach((id) => departmentIds.push(id));
            params.append("departmentIds", departmentIds);
        }

        // ✅ parse DD/MM/YYYY properly
        const start = parseDDMMYYYY(watch("startDate"));
        const end = parseDDMMYYYY(watch("endDate"));

        if (start) params.append("startDate", watch("startDate"));

        if (end) {
            const today = new Date();
            const endCopy = new Date(end);

            if (endCopy.toDateString() === today.toDateString()) {
                params.append("endDate", convertToDesiredFormat(new Date()));
            } else {
                endCopy.setHours(23, 59, 59, 999);
                params.append("endDate", convertToDesiredFormat(endCopy));
            }
        } else if (watch("endDate")) {
            console.warn("Invalid endDate:", watch("endDate"));
            // optional: show toast / set error
        }

        params.append("companyId", userInfo?.companyId);

        let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === "Asia/Kolkata") userTimeZone = "Asia/Calcutta";
        params.append("timeZone", userTimeZone);

        try {
            const res = await getAllEntriesByUserId(params);
            setRow(res?.data?.result || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleGetAllRecordsGroupByUser = async () => {
        let params = new URLSearchParams();
        let userIds = [];
        let locationIds = [];
        let departmentIds = [];

        if (
            userInfo?.roleName !== "Admin" &&
            userInfo?.roleName !== "Owner" &&
            userInfo?.companyId &&
            watch("selectedUserId").length === 0
        ) {
            params.append("userIds", [userInfo?.employeeId]);
        } else {
            if (watch("selectedUserId") && watch("selectedUserId").length > 0) {
                watch("selectedUserId").forEach((id) => userIds.push(id));
                params.append("userIds", userIds);
            }
        }

        if (watch("locationIds") && watch("locationIds").length > 0) {
            watch("locationIds").forEach((id) => locationIds.push(id));
            params.append("locationIds", locationIds);
        }

        if (watch("selectedDepartmentId") && watch("selectedDepartmentId").length > 0) {
            watch("selectedDepartmentId").forEach((id) => departmentIds.push(id));
            params.append("departmentIds", departmentIds);
        }

        // ✅ parse DD/MM/YYYY properly
        const start = parseDDMMYYYY(watch("startDate"));
        const end = parseDDMMYYYY(watch("endDate"));

        if (start) params.append("startDate", watch("startDate"));

        if (end) {
            const today = new Date();
            const endCopy = new Date(end);

            if (endCopy.toDateString() === today.toDateString()) {
                params.append("endDate", convertToDesiredFormat(new Date()));
            } else {
                endCopy.setHours(23, 59, 59, 999);
                params.append("endDate", convertToDesiredFormat(endCopy));
            }
        } else if (watch("endDate")) {
            console.warn("Invalid endDate:", watch("endDate"));
            // optional: show toast / set error
        }

        params.append("companyId", userInfo?.companyId);

        let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === "Asia/Kolkata") userTimeZone = "Asia/Calcutta";
        params.append("timeZone", userTimeZone);

        try {
            const res = await getAllRecordsGroupByUser(params);
            setRow(res?.data?.result || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleCallFilterAPI = () => {
        if (selectedTab === 0) {
            handleGetAllRecordsGroupByUser()
        } else {
            handleGetAllEntriesByUserId()
        }
    }

    useEffect(() => {
        document.title = "Time Card - Calculate Salary";
        handleSetTitle("Time Card")
        const today = new Date();
        const lastMonth = today.getMonth();
        const defaultFilter = filterOptions?.find(option => option.value === lastMonth);
        setFilter(defaultFilter);
        handleGetCompanyInfo()
        handleCallFilterAPI()
        handleGetAllUsers()
        handleGetAllDepartment()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setDates();
    }, [filter]);


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

    const parseDDMMYYYYTime = (s) => {
        if (!s) return null;

        // "30/01/2026, 10:02:52 PM"
        const [datePart, timePartRaw] = s.split(",").map(t => t.trim());
        if (!datePart || !timePartRaw) return null;

        const [dd, mm, yyyy] = datePart.split("/").map(Number);

        const [timePart, ampm] = timePartRaw.split(" ");
        let [hh, min, ss] = timePart.split(":").map(Number);

        if (ampm === "PM" && hh < 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;

        return new Date(yyyy, mm - 1, dd, hh, min, ss);
    };

    const getTotalDurationInMs = (rows = []) => {
        return rows.reduce((sum, r) => {
            const start = parseDDMMYYYYTime(r?.timeIn);
            const end = parseDDMMYYYYTime(r?.timeOut);

            if (!start || !end) return sum;
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return sum;

            const diff = end - start;
            if (diff <= 0) return sum;

            return sum + diff;
        }, 0);
    };


    const formatHoursToHrMin = (hours) => {
        const hrs = Math.floor(hours);
        const mins = Math.floor((hours - hrs) * 60);
        return `${hrs} hr ${mins} min`;
    };

    const getTotalOT = (data) => {
        if (data?.length > 0) {
            return data.reduce((total, row) => {
                const timeIn = new Date(handleConvertUTCDateToLocalDate(row?.timeIn));
                const timeOut = new Date(handleConvertUTCDateToLocalDate(row?.timeOut));
                const totalHours = parseFloat(row?.companyShiftDto?.totalHours) || 0;

                const workedMs = timeOut - timeIn;
                const workedHours = workedMs / (1000 * 60 * 60); // Convert ms to hours

                const ot = workedHours > totalHours ? workedHours - totalHours : 0;

                return total + ot;
            }, 0);
        } else {
            return 0;
        }
    };

    const formatTotalDuration = (ms) => {
        if (ms == null || Number.isNaN(ms)) return "0 sec"; // handles null/undefined/NaN
        if (ms <= 0) return "0 sec";                         // handles 0 or negative

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) return `${hours} hr ${minutes} min`;
        if (minutes > 0) return `${minutes} min ${seconds} sec`;
        return `${seconds} sec`;
    };


    const handleCloseDialog = () => {
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
        setLoading(false)
        setTimeInOutId(null)
    }

    const handleOpenDeleteDialog = (id) => {
        setTimeInOutId(id)
        setDialog({
            open: true,
            title: 'Delete Time In/Out Record',
            message: 'Are you sure! Do you want to delete this record?',
            actionButtonText: 'Delete'
        })
    }

    const handleDeleteUserInOut = async () => {
        setLoading(true)
        const res = await deleteUserInOut(timeInOutId)
        if (res.data.status !== 200) {
            setAlert({ open: true, message: res?.data?.message, type: "error" })
            setLoading(false)
        } else {
            setLoading(false)
            setTimeInOutId(null)
            handleCallFilterAPI()
            handleCloseDialog()
        }
    }

    const columns = [
        {
            field: 'userName',
            headerName: 'Employee Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 120,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return (
                    <div>
                        {params.row?.firstName} {params.row?.lastName}
                    </div>
                );
            },
        },
        {
            field: 'rowId',
            headerName: 'DAY',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 120,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return (
                    <div>
                        {handleFormateUTCDateToLocalDate(params.row?.createdOn)}
                    </div>
                );
            },
        },
        {
            field: 'timeIn',
            headerName: 'timein',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 110,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return (
                    <>
                        <div className="flex justify-start items-center gap-3">
                            <div className="cursor-pointer">
                                {handleConvertUTCDateToLocalDate(params.row?.timeIn)?.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </div>
                        </div>
                    </>
                );
            },
        },
        {
            field: 'timeOut',
            headerName: 'timeout',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 110,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return (
                    <>
                        {
                            (params.row?.timeOut !== null && params.row?.timeOut !== undefined) ? (
                                <>
                                    <div className="flex justify-start items-center gap-3">
                                        <div className="cursor-pointer">
                                            {handleConvertUTCDateToLocalDate(params?.row?.timeOut)?.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </div>
                                    </div>
                                </>
                            ) : <span>-</span>
                        }
                    </>
                );
            },
        },
        {
            field: 'regular',
            headerName: 'regular',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 110,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return (
                    <div>
                        {params?.row?.companyShiftDto?.totalHours ? `${params?.row?.companyShiftDto?.totalHours} h` : '0 h'}
                    </div>
                );
            },
        },
        {
            field: 'ot',
            headerName: 'OT',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 80,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                const timeIn = new Date(handleConvertUTCDateToLocalDate(params.row?.timeIn));
                const timeOut = new Date(handleConvertUTCDateToLocalDate(params.row?.timeOut));
                const totalHours = parseFloat(params.row?.companyShiftDto?.totalHours) || 0;

                // Calculate worked hours
                const durationMs = timeOut - timeIn;
                const workedHours = durationMs / (1000 * 60 * 60); // in hours

                // Calculate OT if workedHours > totalHours
                let otHours = 0;
                if (workedHours > totalHours) {
                    otHours = workedHours - totalHours;
                }

                // Format OT hours into hr/min
                const otWholeHours = Math.floor(otHours);
                const otMinutes = Math.floor((otHours - otWholeHours) * 60);

                const formattedOT =
                    otWholeHours > 0 || otMinutes > 0
                        ? `${otWholeHours > 0 ? `${otWholeHours} hrs` : ''}${otMinutes > 0 ? ` ${otMinutes} min` : ''}`.trim()
                        : '00:00';

                return <div>{formattedOT}</div>;
            }
        },
        {
            field: 'total',
            headerName: 'total',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 110,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return (
                    <div>
                        {formatDuration(handleConvertUTCDateToLocalDate(params.row?.timeIn), handleConvertUTCDateToLocalDate(params.row?.timeOut))}
                    </div>
                );
            },
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 80,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-start h-full'>
                        <PermissionWrapper
                            functionalityName="Time Card"
                            moduleName="Clock-In-Out"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenInOutModal(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Time Card"
                            moduleName="Clock-In-Out"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    const getRowId = (row) => {
        return row.id;
    }

    const generatePDF = async () => {
        setShowPdfContent(true);
        setLoadingPdf(true);

        setTimeout(async () => {
            const pdf = new jsPDF("p", "mm", "a4");
            const pages = document.querySelectorAll(".pdf-page");

            if (!pages.length) {
                setShowPdfContent(false);
                setLoadingPdf(false);
                return;
            }

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];

                const canvas = await html2canvas(page, {
                    scale: 1.2,                // ✅ reduced
                    useCORS: true,
                    backgroundColor: "#ffffff",
                });

                // ✅ JPEG instead of PNG
                const imgData = canvas.toDataURL("image/jpeg", 0.75);

                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (i > 0) pdf.addPage();

                pdf.addImage(
                    imgData,
                    "JPEG",
                    10,
                    10,
                    imgWidth,
                    imgHeight,
                    undefined,
                    "FAST"        // ✅ jsPDF compression
                );
            }

            pdf.save(
                `Employee_Attendance_Report_${dayjs(watch("startDate"), "DD/MM/YYYY").format("DD-MM-YYYY")}_To_${dayjs(watch("endDate"), "DD/MM/YYYY").format("DD-MM-YYYY")}.pdf`
            );

            setShowPdfContent(false);
            setLoadingPdf(false);
        }, 300);
    };

    const actionButtons = () => {
        return (
            <div className='flex justify-start items-center gap-3 w-[23rem]'>
                <Button type={`button`} useFor={'error'} text={'Download PDF'} isLoading={loadingPdf} onClick={() => generatePDF()} startIcon={<CustomIcons iconName="fa-solid fa-file-pdf" css="h-5 w-5" />} />
                <PermissionWrapper
                    functionalityName="Time Card"
                    moduleName="Clock-In-Out"
                    actionId={1}
                    component={
                        <Button type={`button`} text={'Clock In/Out'} onClick={() => handleOpenInOutModal()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    }
                />
            </div>
        )
    }

    return (
        <>
            <div className='py-2 px-4 lg:p-4 border rounded-lg bg-white'>
                <div className='grid grid-col-12 md:grid-cols-6 gap-3 items-center'>
                    <div>
                        <Select
                            options={filterOptions}
                            label={"Filter by Duration"}
                            placeholder="Select duration"
                            value={filter?.id}
                            onChange={(_, newValue) => {
                                setFilter(newValue?.value ? newValue : null);
                            }}
                        />
                    </div>

                    <div className='mb-4 w-full md:mb-0'>
                        <DatePickerComponent setValue={setValue} control={control} name='startDate' label={`Start Date`} minDate={null} maxDate={watch("endDate")} />
                    </div>

                    <div className='mb-4 w-full md:mb-0'>
                        <DatePickerComponent setValue={setValue} control={control} name='endDate' label={`End Date`} minDate={watch("startDate")} maxDate={new Date()} />
                    </div>

                    {((userInfo?.roleName === "Admin" || userInfo?.roleName === "Owner") && userInfo?.companyId) ? (
                        <div className='mb-4 w-full md:mb-0'>
                            <Controller
                                name="selectedUserId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={users}
                                        label={"Emmployee List"}
                                        placeholder="Select employees"
                                        value={watch("selectedUserId")?.[0] || []}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                field.onChange([newValue.id]);
                                            } else {
                                                setValue("selectedUserId", null);
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                    ) : null}

                    <div className='mb-4 w-full md:mb-0'>
                        <Controller
                            name="selectedDepartmentId"
                            control={control}
                            render={({ field }) => (
                                <SelectMultiple
                                    options={department}
                                    label={"Select Department"}
                                    placeholder="Select department"
                                    value={field.value || []}
                                    onChange={(newValue) => {
                                        field.onChange(newValue);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div className='w-32'>
                        <Button type={`button`} text={'Filter'} onClick={() => handleCallFilterAPI()} startIcon={<CustomIcons iconName="fa-solid fa-filter" css="h-5 w-5" />} />
                    </div>
                </div>

                <div className='my-4'>
                    <Tabs tabsData={tabData} selectedTab={selectedTab} handleChange={handleChangeTab} type={'underline'} />
                </div>

                <div className='border rounded-lg bg-white lg:w-full shadow-[0px_4px_14px_0px_rgba(38,43,67,0.16)]'>
                    <div>
                        <DataTable columns={columns} rows={rows} getRowId={getRowId} showButtons={true} buttons={actionButtons} />
                    </div>
                </div>

                <div className="self-stretch md:inline-flex justify-start items-center gap-10 mt-5">
                    <div className="md:inline-flex flex-col justify-center items-start gap-3">
                        <div className="inline-flex justify-start items-center gap-[15px]">
                            <div className="justify-start text-xs font-bold  uppercase leading-normal tracking-tight">Total Hours :</div>
                            <div className="justify-start text-xs font-medium uppercase leading-normal tracking-tight">{formatTotalDuration(getTotalDurationInMs(rows))}</div>
                        </div>
                    </div>

                    <div className="md:inline-flex flex-col justify-center items-start gap-3">
                        <div className="inline-flex justify-start items-center gap-[15px]">
                            <div className="justify-start text-xs font-bold uppercase leading-normal tracking-tight">Total OT : </div>
                            <div className="justify-start text-xs font-medium uppercase leading-normal tracking-tight">{formatHoursToHrMin(getTotalOT(rows))}</div>
                        </div>
                    </div>

                </div>
            </div>
            {showPdfContent && (
                <div className='absolute top-0 left-0 z-[-1] w-[180vh] opacity-0'>
                    <DetailedPDFTable data={rows} companyInfo={companyInfo} startDate={watch("startDate")} endDate={watch("endDate")} />
                </div>
            )}
            <AddClockInOut open={openInOutModel} handleClose={handleCloseInOutModal} employeeList={users} getRecords={handleCallFilterAPI} id={clockInOutId} />
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteUserInOut} handleClose={handleCloseDialog} loading={loading} />

        </>
    )
}

const mapDispatchToProps = {
    handleSetTitle,
    setAlert
};

export default connect(null, mapDispatchToProps)(TimeCard);