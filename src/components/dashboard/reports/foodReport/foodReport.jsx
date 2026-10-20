import { useState, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { connect } from "react-redux";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAllEmployeeListByCompanyId } from "../../../../service/companyEmployee/companyEmployeeService";
import { getAllDepartment } from "../../../../service/department/departmentService";
import { getListOfYears } from "../../../../service/common/commonService";
import { getEmployeeFoodReport } from "../../../../service/userInOut/userInOut";
import { getCompanyDetails } from "../../../../service/companyDetails/companyDetailsService";
import { handleSetTitle, setAlert } from "../../../../redux/commonReducers/commonReducers";
import Select from "../../../common/select/select";
import SelectMultiple from "../../../common/select/selectMultiple";
import DataTable from "../../../common/table/table";
import DatePickerComponent from "../../../common/datePickerComponent/datePickerComponent";
import Button from "../../../common/buttons/button";
import CustomIcons from "../../../common/icons/CustomIcons";
import FoodPDFTable from "./foodPDFTable";

const filterOptions = [
    { id: 1, title: 'January', value: 1 },
    { id: 2, title: 'February', value: 2 },
    { id: 3, title: 'March', value: 3 },
    { id: 4, title: 'April', value: 4 },
    { id: 5, title: 'May', value: 5 },
    { id: 6, title: 'June', value: 6 },
    { id: 7, title: 'July', value: 7 },
    { id: 8, title: 'August', value: 8 },
    { id: 9, title: 'September', value: 9 },
    { id: 10, title: 'October', value: 10 },
    { id: 11, title: 'November', value: 11 },
    { id: 12, title: 'December', value: 12 }
];

const FoodReport = ({ setAlert, handleSetTitle }) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [years, setYears] = useState([]);
    const [users, setUsers] = useState([]);
    const [department, setDepartment] = useState([]);
    const [row, setRow] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filter, setFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [loadingDownloadPdf, setLoadingDownloadPdf] = useState(false);
    const [showPdfContent, setShowPdfContent] = useState(false);

    const {
        control,
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            startDate: null,
            endDate: (() => {
                const today = new Date();
                return `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${today.getFullYear()}`;
            })(),
            selectedUserId: [],
            selectedDepartmentId: [],
        }
    });

    const startDate = watch("startDate");
    const endDate = watch("endDate");
    const selectedUserId = watch("selectedUserId");
    const selectedDepartmentId = watch("selectedDepartmentId");

    const setDates = () => {
        if (!filter?.value || !selectedYear) return;
        const selectedMonth = filter?.value;

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const year = selectedYear;

        const start = new Date(year, selectedMonth - 1, 1);

        let end;
        if (selectedMonth === currentMonth && year === currentYear) {
            end = today;
        } else {
            end = new Date(year, selectedMonth, 0); // last day of selected month
        }

        const formatDate = (date) => {
            return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${date.getFullYear()}`;
        };

        // Update form values
        setValue('startDate', formatDate(start));
        setValue('endDate', formatDate(end));
    };

    const handleGetAllUsers = async () => {
        if (userInfo?.companyId) {
            const response = await getAllEmployeeListByCompanyId(userInfo?.companyId);
            const data = response?.data?.result?.map((row) => {
                return {
                    id: row.employeeId,
                    title: row.userName
                };
            }) || [];
            setUsers(data);
        }
    };

    const handleGetAllDepartment = async () => {
        if (userInfo?.companyId) {
            const response = await getAllDepartment(userInfo?.companyId);
            if (response?.data?.status === 200) {
                const data = response?.data?.result?.map((item) => {
                    return {
                        id: item?.id,
                        title: item?.departmentName,
                    };
                }) || [];
                setDepartment(data);
            }
        }
    };

    const handleGetAllYears = () => {
        const yearsList = getListOfYears();
        setYears(yearsList);
    };

    const handleGetCompanyInfo = async () => {
        if (userInfo?.companyId) {
            const response = await getCompanyDetails(userInfo.companyId);
            setCompanyInfo(response?.data?.result);
        }
    };

    const handleGetFoodReport = async () => {
        if (!userInfo?.companyId) return;

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("companyId", userInfo.companyId);

            if (startDate) {
                params.append("startDate", startDate);
            }
            if (endDate) {
                params.append("endDate", endDate);
            }

            let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (userTimeZone === "Asia/Kolkata") {
                userTimeZone = "Asia/Calcutta";
            }
            params.append("timeZone", userTimeZone);

            if (selectedUserId && selectedUserId.length > 0) {
                params.append("userIds", selectedUserId.join(","));
            }

            if (selectedDepartmentId && selectedDepartmentId.length > 0) {
                params.append("departmentIds", selectedDepartmentId.join(","));
            }

            const res = await getEmployeeFoodReport(params.toString());
            if (res?.data?.status === 200) {
                const resultData = Array.isArray(res?.data?.result) ? res.data.result : [];
                const formattedData = resultData.map((item, index) => ({
                    ...item,
                    id: item.employeeId || `emp-${index}`,
                    rowId: index + 1
                }));
                setRow(formattedData);
            } else {
                setRow([]);
                if (res?.data?.message) {
                    setAlert({
                        open: true,
                        type: 'error',
                        message: res.data.message
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching food report:", error);
            setRow([]);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePdfClick = () => {
        setShowPdfContent(true);
        setLoadingDownloadPdf(true);

        setTimeout(async () => {
            const pages = document.querySelectorAll(".pdf-page");

            if (!pages.length) {
                setShowPdfContent(false);
                setLoadingDownloadPdf(false);
                return;
            }

            // 1. Render all pages to canvases and calculate dynamic heights
            const renderedPages = [];
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const canvas = await html2canvas(page, {
                    scale: 1.2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                });
                const imgData = canvas.toDataURL("image/jpeg", 0.75);

                // Calculate dimensions in mm (width is fixed at 210mm)
                const imgWidthMM = 210;
                const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width;

                renderedPages.push({ imgData, width: imgWidthMM, height: imgHeightMM });
            }

            // 2. Initialize jsPDF using the first page's dynamic dimensions
            const firstPage = renderedPages[0];
            const pdf = new jsPDF("p", "mm", [firstPage.width, firstPage.height]);

            // 3. Add images to PDF
            for (let i = 0; i < renderedPages.length; i++) {
                const rendered = renderedPages[i];
                if (i > 0) {
                    pdf.addPage([rendered.width, rendered.height]);
                }
                pdf.addImage(rendered.imgData, "JPEG", 0, 0, rendered.width, rendered.height, undefined, "FAST");
            }

            const formattedStart = startDate ? startDate.replace(/\//g, "-") : "";
            const formattedEnd = endDate ? endDate.replace(/\//g, "-") : "";
            const fileName = `Employee_Food_Report_${formattedStart}_To_${formattedEnd}.pdf`;
            pdf.save(fileName);

            setShowPdfContent(false);
            setLoadingDownloadPdf(false);
        }, 300);
    };

    useEffect(() => {
        handleSetTitle("Food Report");
        document.title = "Food Report - Calculate Salary";
        const today = new Date();
        const lastMonth = today.getMonth();
        const defaultFilter = filterOptions.find(option => option.value === (lastMonth === 0 ? 12 : lastMonth));
        setFilter(defaultFilter);
        handleGetAllYears();
        handleGetAllUsers();
        handleGetAllDepartment();
        handleGetCompanyInfo();
    }, []);

    useEffect(() => {
        setDates();
        setValue("selectedUserId", []);
    }, [filter, selectedYear]);

    useEffect(() => {
        if (startDate && endDate) {
            handleGetFoodReport();
        }
    }, [selectedUserId, selectedDepartmentId, selectedYear, startDate, endDate]);

    const columns = useMemo(() => {
        return [
            {
                field: 'rowId',
                headerName: '#',
                headerClassName: 'uppercase',
                flex: 0.5,
                maxWidth: 80,
                sortable: false,
                renderCell: (params) =>
                    params.row?.isTotalRow ? null : <span>{params.value}</span>
            },
            {
                field: 'employeeName',
                headerName: 'Employee Name',
                headerClassName: 'uppercase',
                flex: 1.5,
                minWidth: 200,
                sortable: false,
                renderCell: (params) =>
                    params.row?.isTotalRow ? (
                        <strong className="font-semibold text-gray-900">Total</strong>
                    ) : (
                        <span>{params.value || 'N/A'}</span>
                    )
            },
            {
                field: 'totalFoodAmount',
                headerName: 'Total Food Amount',
                headerClassName: 'uppercase',
                flex: 1.2,
                minWidth: 160,
                align: 'right',
                headerAlign: 'right',
                sortable: false,
                renderCell: (params) => (
                    <strong className="font-semibold text-gray-900">
                        ₹{Number(params.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                )
            }
        ];
    }, []);

    const footerRowData = useMemo(() => {
        if (!row || row.length === 0) return null;
        const totalFoodAmount = row.reduce((sum, item) => sum + (Number(item.totalFoodAmount) || 0), 0);

        return {
            id: 'food-report-total-row',
            rowId: 'Total',
            employeeName: 'Total',
            presentDays: "-",
            absentDays: "-",
            weekOffDays: "-",
            holidayDays: "-",
            foodAmount: '-',
            totalFoodAmount: totalFoodAmount,
            isTotalRow: true
        };
    }, [row]);

    const getRowId = (item) => item.id;

    const actionButtons = () => {
        return (
            <div className="flex justify-end items-center gap-3">
                <Button
                    type="button"
                    useFor="error"
                    text="Download PDF"
                    disabled={row?.length === 0}
                    isLoading={loadingDownloadPdf}
                    onClick={handleGeneratePdfClick}
                    startIcon={<CustomIcons iconName="fa-solid fa-file-pdf" css="h-5 w-5" />}
                />
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Filter Section */}
            <div className="py-2 px-4 lg:p-4 border rounded-lg bg-white shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
                    <div>
                        <Select
                            options={years}
                            label={"Select Year"}
                            placeholder="Select Year"
                            value={selectedYear}
                            onChange={(_, newValue) => {
                                setSelectedYear(newValue?.id);
                            }}
                        />
                    </div>

                    <div>
                        <Select
                            options={filterOptions}
                            label={"Filter by Duration"}
                            placeholder="Select Duration"
                            value={filter?.id}
                            onChange={(_, newValue) => {
                                setFilter(newValue?.value ? newValue : filterOptions[0]);
                            }}
                        />
                    </div>

                    <div>
                        <DatePickerComponent
                            setValue={setValue}
                            control={control}
                            name="startDate"
                            label="Start Date"
                            minDate={null}
                            maxDate={endDate}
                        />
                    </div>

                    <div>
                        <DatePickerComponent
                            setValue={setValue}
                            control={control}
                            name="endDate"
                            label="End Date"
                            minDate={startDate}
                            maxDate={new Date()}
                        />
                    </div>

                    <div>
                        <Controller
                            name="selectedUserId"
                            control={control}
                            render={({ field }) => (
                                <SelectMultiple
                                    options={users}
                                    label={"Select Employees"}
                                    placeholder={users?.length > 0 ? "Select employees" : "No employees"}
                                    value={field.value || []}
                                    onChange={(newValue) => {
                                        field.onChange(newValue);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div>
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
                </div>
            </div>

            {/* DataTable Section */}
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <DataTable
                    columns={columns}
                    rows={row}
                    getRowId={getRowId}
                    height={550}
                    showSearch={true}
                    showButtons={true}
                    buttons={actionButtons}
                    footerRowData={footerRowData}
                />
            </div>

            {/* Hidden PDF container for rendering to canvas */}
            {showPdfContent && (
                <div className="absolute top-0 left-0 z-[-1] w-[800px] opacity-0 pointer-events-none">
                    <FoodPDFTable
                        data={row}
                        companyInfo={companyInfo}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>
            )}
        </div>
    );
};

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(FoodReport);