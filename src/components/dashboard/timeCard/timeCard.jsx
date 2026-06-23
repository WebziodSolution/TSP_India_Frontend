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
import 'dayjs/plugin/timezone';

import { deleteUserInOut, getAllEntriesByUserId, getAllRecordsGroupByUser } from '../../../service/userInOut/userInOut';
import { filterOptionsByMonth, handleFormateUTCDateToLocalDate } from '../../../service/common/commonService';
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
import { BulkClockInOut } from '../../models/clockInOut/bulkClockInOut';


const tabData = [
    { label: 'User Summary' },
    { label: 'All Entries' },
];

const parseDDMMYYYY = (s) => {
    if (!s || typeof s !== "string") return null;
    const [dd, mm, yyyy] = s.split("/").map((v) => parseInt(v, 10));
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
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
    const [bulkInOutModel, setBulkInOutModel] = useState(false);

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

    // --- Helper functions for grouped view totals ---
    const sumTimeStrings = (items, field) => {
        let totalMinutes = 0;
        items.forEach(item => {
            const timeStr = item[field];
            if (timeStr && typeof timeStr === 'string' && timeStr.includes(':')) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                totalMinutes += hours * 60 + minutes;
            }
        });
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        // const decimal = (Math.round((totalMinutes / 60) * 100) / 100).toFixed(2);
        return `${hrs} hr ${mins} min`;
    };

    const createUserTotalRow = (user) => {
        const entries = user.data || [];
        return {
            id: `total-${user.id}`,
            userName: 'Total',
            rowId: '',
            timeIn: '',
            timeOut: '',
            regular: sumTimeStrings(entries, 'regular'),
            overtime: sumTimeStrings(entries, 'overtime'),
            totalHours: sumTimeStrings(entries, 'totalHours'),
            workHours: sumTimeStrings(entries, 'workHours'),
            action: '',
        };
    };

    // --- Modal handlers ---
    const handleOpenInOutModal = (id = null) => {
        setClockInOutId(id);
        setOpenInOutModel(true);
    }

    const handleCloseInOutModal = () => {
        setOpenInOutModel(false);
    }

    const handleCloseBulkInOutModal = () => {
        setBulkInOutModel(false);
    }

    const handleOpenBulkInOutModal = () => {
        setBulkInOutModel(true);
    }

    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    // --- Date conversion helpers ---
    function convertToDesiredFormat(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    }

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

    // --- Data fetching functions ---
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
        if (selectedMonth === null) return;
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

        const start = parseDDMMYYYY(watch("startDate") ? watch("startDate") : (() => {
            const today = new Date();
            const day = "01";
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const year = today.getFullYear();
            return `${day}/${month}/${year}`;
        })());
        const end = parseDDMMYYYY(watch("endDate") ? watch("endDate") : (() => {
            const today = new Date();
            const day = "01";
            const month = (today.getMonth() + 1).toString().padStart(2, "0");
            const year = today.getFullYear();
            return `${day}/${month}/${year}`;
        })());

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
        }

        params.append("companyId", userInfo?.companyId);

        let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === "Asia/Kolkata") userTimeZone = "Asia/Calcutta";
        params.append("timeZone", userTimeZone);

        try {
            const res = await getAllRecordsGroupByUser(params);
            setRow(res?.data?.result?.users || []);
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

    // --- Effects ---
    useEffect(() => {
        document.title = "Time Card - Calculate Salary";
        handleSetTitle("Time Card")

        const today = new Date();
        const lastMonth = today.getMonth();
        const defaultFilter = filterOptionsByMonth?.find(option => option.value === lastMonth);
        setFilter(defaultFilter);

        handleGetCompanyInfo()
        handleGetAllUsers()
        handleGetAllDepartment()
        handleCallFilterAPI()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setDates();
    }, [filter]);

    useEffect(() => {
        handleCallFilterAPI()
    }, [selectedTab])

    // --- Delete dialog handlers ---
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

    // --- Table columns ---
    const columns = [
        {
            field: 'userName',
            headerName: 'Employee Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 170,
            align: "left",
            headerAlign: "left",
        },
        {
            field: 'rowId',
            headerName: 'DAY',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 130,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return <div>{handleFormateUTCDateToLocalDate(params.row?.createdOn)}</div>;
            },
        },
        {
            field: 'regular',
            headerName: 'regular(HR)',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 120,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return <div>{params?.row?.regular}</div>;
            },
        },
        {
            field: 'timeIn',
            headerName: 'timein',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 120,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                const timeIn = params.row?.timeIn ? parseDDMMYYYYTime(params.row.timeIn) : null;
                return timeIn ? (
                    <div>
                        {timeIn.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })
                        }
                    </div>
                ) : <span>-</span>;
            },
        },
        {
            field: 'timeOut',
            headerName: 'timeout',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 120,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                const timeOut = params.row?.timeOut ? parseDDMMYYYYTime(params.row.timeOut) : null;
                return timeOut ? (
                    <div>
                        {timeOut.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })
                        }
                    </div>
                ) : <span>-</span>;
            },
        },
        {
            field: 'totalHours',
            headerName: 'Total Hours',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 130,
            align: "left",
            headerAlign: "left",
        },
        {
            field: 'breakTime',
            headerName: 'Break Time',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 130,
            align: "left",
            headerAlign: "left",
        },
        {
            field: 'overtime',
            headerName: 'OT',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 100,
            align: "left",
            headerAlign: "left",
        },
        {
            field: 'workHours',
            headerName: 'Work Hours',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 140,
            align: "left",
            headerAlign: "left",
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 100,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                const status = params.row?.status;
                let color = 'inherit';
                let fontWeight = 'normal';
                if (status === 'A') {
                    color = '#ff0000';
                    fontWeight = 'bold';
                } else if (status === 'W') {
                    color = '#19ff13';
                    fontWeight = 'bold';
                } else if (status === 'H') {
                    color = '#ff8443';
                    fontWeight = 'bold';
                }
                else if (status === 'PW') {
                    color = '#0303fc';
                    fontWeight = 'bold';
                }
                return <span style={{ color, fontWeight }}>{status || '-'}</span>;
            }
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            align: "right",
            headerAlign: "right",
            renderCell: (params) => {
                // Safely check if this is a total row (id starts with 'total-')
                const rowId = params?.row?.id;
                if (!rowId) return null; // no id, don't render actions
                if (typeof rowId === 'string' && rowId.startsWith('total-')) {
                    return null; // hide actions for total rows
                }
                // For all other rows (ids can be numbers or strings), show actions
                return (
                    <div className='flex items-center gap-2 justify-end h-full'>
                        <PermissionWrapper
                            functionalityName="Time Card"
                            moduleName="Clock-In-Out"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenInOutModal(params.row.id)}>
                                        <CustomIcons iconName='fa-solid fa-pen-to-square' css='cursor-pointer text-white h-4 w-4' />
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
                                        <CustomIcons iconName='fa-solid fa-trash' css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    const groupedColumns = columns
        .map(col => {
            // Remove maxWidth so the 9 remaining columns fill the full table width evenly
            // eslint-disable-next-line no-unused-vars
            const { maxWidth, ...rest } = col;

            if (col.field === 'regular') {
                return { ...rest, renderCell: (params) => <div>{params?.row?.regular}</div> };
            }
            if (col.field === 'breakTime') {
                return { ...rest, renderCell: (params) => <div>{params.row.breakTime || '-'}</div> };
            }
            if (col.field === 'workHours') {
                return { ...rest, renderCell: (params) => <div>{params.row.workHours || '00:00'}</div> };
            }
            if (col.field === 'ot') {
                return { ...rest, renderCell: (params) => <div>{params.row.overtime || '00:00'}</div> };
            }
            if (col.field === 'total') {
                return { ...rest, renderCell: (params) => <div>{params.row.totalHours || '00:00'}</div> };
            }
            if (col.field === 'status') {
                return {
                    ...rest,
                    renderCell: (params) => {
                        const status = params.row?.status;
                        let color = 'inherit';
                        let fontWeight = 'normal';
                        if (status === 'A') {
                            color = '#ff0000';
                            fontWeight = 'bold';
                        } else if (status === 'W') {
                            color = '#19ff13';
                            fontWeight = 'bold';
                        } else if (status === 'H') {
                            color = '#ff8443';
                            fontWeight = 'bold';
                        } else if (status === 'PW') {
                            color = '#0303fc';
                            fontWeight = 'bold';
                        }
                        return <div style={{ color, fontWeight }}>{status || "-"}</div>;
                    }
                };
            }

            return rest;
        })
        .filter(col => col.field !== 'userName');

    const getRowId = (row) => {
        if (selectedTab === 0) {
            return row.rowId;
        } else {
            return row.id;
        }
    };

    // --- PDF generation ---
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
                    scale: 1.2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                });
                const imgData = canvas.toDataURL("image/jpeg", 0.75);
                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight, undefined, "FAST");
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
            <div className='flex justify-start items-center gap-3 w-[33rem]'>
                <Button type={`button`} useFor={'error'} text={'Download PDF'} isLoading={loadingPdf} onClick={() => generatePDF()} startIcon={<CustomIcons iconName="fa-solid fa-file-pdf" css="h-5 w-5" />} />
                <PermissionWrapper
                    functionalityName="Time Card"
                    moduleName="Clock-In-Out"
                    actionId={1}
                    component={
                        <Button type={`button`} text={'Clock In/Out'} onClick={() => handleOpenInOutModal()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    }
                />
                <PermissionWrapper
                    functionalityName="Time Card"
                    moduleName="Clock-In-Out"
                    actionId={1}
                    component={
                        <Button type={`button`} useFor='success' text={'Bulk In/Out'} onClick={() => handleOpenBulkInOutModal()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    }
                />
            </div>
        )
    }

    // --- Render ---
    return (
        <>
            <div className='py-2 px-4 lg:p-4 border rounded-lg bg-white'>
                <div className='grid grid-col-12 md:grid-cols-6 gap-3 items-center'>
                    <div>
                        <Select
                            options={filterOptionsByMonth}
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

                {selectedTab === 0 ? (
                    <div>
                        <div className="mb-4 flex justify-end">
                            {actionButtons()}
                        </div>
                        {rows?.map((user) => (
                            <div key={user.id} className="mb-6 border p-4 rounded-lg shadow-sm">
                                <div className='flex justify-start items-center mb-3'>
                                    <div className='grow'>
                                        <h3 className="text-lg font-semibold text-gray-700 capitalize text-start">{user.username} - {user.department}</h3>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-700 capitalize text-end">
                                            Present: {user.presentCount || '0'} &nbsp;&nbsp;&nbsp; Absent: {user.absentCount || '0'} &nbsp;&nbsp;&nbsp; Weekly-Off: {user.weeklyOffCount || '0'} &nbsp;&nbsp;&nbsp; Holiday: {user.holidayCount || '0'}
                                        </p>
                                    </div>
                                </div>
                                <DataTable
                                    columns={groupedColumns}
                                    rows={user?.data || []}
                                    getRowId={getRowId}
                                    height={user.data?.length > 0 ? 350 : 150}
                                    showButtons={false}
                                    footerRowData={user.data?.length > 0 ? createUserTotalRow(user) : null}
                                    footerRowClassName="total-row"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='border rounded-lg bg-white lg:w-full shadow-[0px_4px_14px_0px_rgba(38,43,67,0.16)]'>
                        <div>
                            <DataTable columns={columns} rows={rows} getRowId={getRowId} showButtons={true} buttons={actionButtons} />
                        </div>
                    </div>
                )}

                {/* <div className="self-stretch md:inline-flex justify-start items-center gap-10 mt-5">
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
                </div> */}
            </div>

            {showPdfContent && (
                <div className='absolute top-0 left-0 z-[-1] w-[180vh] opacity-0'>
                    <DetailedPDFTable data={rows} companyInfo={companyInfo} startDate={watch("startDate")} endDate={watch("endDate")} selectedTab={selectedTab} />
                </div>
            )}
            <AddClockInOut open={openInOutModel} handleClose={handleCloseInOutModal} employeeList={users} getRecords={handleCallFilterAPI} id={clockInOutId} />
            <BulkClockInOut open={bulkInOutModel} handleClose={handleCloseBulkInOutModal} getRecords={handleCallFilterAPI} />

            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteUserInOut} handleClose={handleCloseDialog} loading={loading} />
        </>
    );
};

const mapDispatchToProps = {
    handleSetTitle,
    setAlert
};

export default connect(null, mapDispatchToProps)(TimeCard);