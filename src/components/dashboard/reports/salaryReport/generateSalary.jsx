import { useEffect, useState, useMemo } from "react";
import { getAllEmployeeListByCompanyId } from "../../../../service/companyEmployee/companyEmployeeService";
import { Controller, useForm } from "react-hook-form";
import Select from "../../../common/select/select";
import { getAllDepartment } from "../../../../service/department/departmentService";
import { getEmployeeSalaryStatements } from "../../../../service/employeeSalaryStatement/employeeSalaryStatementService";
import SelectMultiple from "../../../common/select/selectMultiple";
import DataTable from "../../../common/table/table";
import Button from "../../../common/buttons/button";
import CustomIcons from "../../../common/icons/CustomIcons";
import { getListOfYears } from "../../../../service/common/commonService";
import AlertDialog from "../../../common/alertDialog/alertDialog";
import { addSalaryStatement } from "../../../../service/salaryStatementHistory/salaryStatementHistoryService";
import { handleSetTitle, setAlert } from "../../../../redux/commonReducers/commonReducers";
import { connect } from "react-redux";
import PermissionWrapper from "../../../common/permissionWrapper/PermissionWrapper";
import DatePickerComponent from "../../../common/datePickerComponent/datePickerComponent";

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

const GenerateSalary = ({ setAlert, handleSetTitle }) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [years, setYears] = useState([]);

    const [users, setUsers] = useState([]);
    const [department, setDepartment] = useState([]);
    const [row, setRow] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filter, setFilter] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);

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

    const setDates = () => {
        const selectedMonth = filter?.value;

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const year = today.getFullYear();

        const start = new Date(year, selectedMonth - 1, 1);

        let end;
        if (selectedMonth === currentMonth) {
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

    const handleOpenSalaryDialog = () => {
        setDialog({
            open: true,
            title: 'Generate & Save Salary',
            message: `Are you sure! Do you want to generate and save the salary statements for ${filter?.title}-${selectedYear}?`,
            actionButtonText: 'Save Salary',
        });
    }

    const handleCloseSalaryDialog = () => {
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleSaveSalary = async () => {
        setLoading(true);
        let data = {
            startDate: null,
            endDate: null,
            timeZone: "",
            month: filter?.value,
            year: selectedYear,
            employeeIds: [],
            departmentIds: [],
            companyId: userInfo?.companyId || "",
        };
        if (watch("selectedDepartmentId") && watch("selectedDepartmentId").length > 0) {
            data.departmentIds = watch("selectedDepartmentId");
        }
        if (watch("selectedUserId") && watch("selectedUserId").length > 0) {
            data.employeeIds = watch("selectedUserId");
        }
        if (watch("startDate")) {
            data.startDate = watch("startDate")
        }
        if (watch("endDate")) {
            data.endDate = watch("endDate")
        }

        let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === "Asia/Kolkata") {
            userTimeZone = "Asia/Calcutta";
        }

        data.timeZone = userTimeZone;
        try {
            const response = await getEmployeeSalaryStatements(data);
            if (response?.data?.status === 200) {
                const newData = response?.data?.result?.map(({ id, ...rest }) => {
                    return {
                        ...rest,
                        year: selectedYear,
                        monthNumber: filter?.value,
                        monthYear: `${filter?.title}-${selectedYear}`,
                        startDate: watch("startDate"),
                        endDate: watch("endDate"),
                        timeZone: userTimeZone,
                        generatedBy: userInfo?.employeeId,
                    };
                });

                const res = await addSalaryStatement(newData);
                if (res?.data?.status === 201) {
                    setLoading(false);
                    handleGetStatements();
                    handleCloseSalaryDialog();
                    setAlert({
                        open: true,
                        type: 'success',
                        message: 'Salary statements saved successfully!'
                    })
                } else {
                    setAlert({
                        open: true,
                        type: 'error',
                        message: res?.data?.message || 'Failed to save salary statements!'
                    })
                }
            } else {
                setAlert({
                    open: true,
                    type: 'error',
                    message: response?.data?.message || 'Failed to fetch salary statements!'
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        setLoading(false);
    }

    const handleGetStatements = async () => {
        let data = {
            startDate: null,
            endDate: null,
            timeZone: "",
            month: filter?.value,
            year: selectedYear,
            employeeIds: watch("selectedUserId") || [],
            departmentIds: watch("selectedDepartmentId") || [],
            companyId: userInfo?.companyId || "",
        };
        if (watch("startDate")) {
            data.startDate = watch("startDate")
        }
        if (watch("endDate")) {
            data.endDate = watch("endDate")
        }
        let userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === "Asia/Kolkata") {
            userTimeZone = "Asia/Calcutta";
        }
        data.timeZone = userTimeZone;
        try {
            if (data?.month && data?.year) {
                const res = await getEmployeeSalaryStatements(data);
                if (res?.data?.status === 200) {
                    const newData = res.data.result?.map((item, index) => ({
                        ...item,
                        // Ensure 'id' for DataGrid, and 'rowId' for your internal logic/PDF
                        id: item.employeeSalaryStatementId || `employee-${item.employeeId}-${index}`, // Ensure unique 'id' for DataGrid
                        rowId: index + 1
                    }));
                    setRow(newData || []);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleGetAllUsers = async () => {
        if (userInfo?.companyId) {
            const response = await getAllEmployeeListByCompanyId(userInfo?.companyId);
            const data = response.data.result?.map((row) => {
                return {
                    id: row.employeeId,
                    title: row.userName
                };
            });
            setUsers(data);
        }
    };

    const handleGetAllDepartment = async () => {
        if (userInfo?.companyId) {
            const response = await getAllDepartment(userInfo?.companyId);
            if (response.data.status === 200) {
                const data = response.data?.result?.map((item) => {
                    return {
                        id: item?.id,
                        title: item?.departmentName,
                    };
                });
                setDepartment(data);
            }
        }
    };

    const handleGetAllYears = () => {
        const years = getListOfYears();
        setYears(years);
    }

    useEffect(() => {
        handleSetTitle("Generate Salary");
        document.title = "Generate Salary - Calculate Salary";
        const today = new Date();
        const lastMonth = today.getMonth();
        const defaultFilter = filterOptions.find(option => option.value === (lastMonth === 0 ? 12 : lastMonth));
        setFilter(defaultFilter);
        handleGetAllYears()
        handleGetAllUsers();
        handleGetAllDepartment();
    }, []);

    useEffect(() => {
        setDates();
    }, [filter]);

    useEffect(() => {
        handleGetStatements();
    }, [watch("selectedUserId"), watch("selectedDepartmentId"), selectedYear, watch("startDate"), watch("endDate")]);


    const groupedDataForDisplay = useMemo(() => {
        if (row.length === 0) return null; // No data, no groups

        const allDepartments = {};
        row.forEach(item => {
            const deptName = item.departmentName || 'N/A';
            if (!allDepartments[deptName]) {
                allDepartments[deptName] = [];
            }
            allDepartments[deptName].push(item);
        });

        // If departments are selected, filter the grouped data
        if (watch("selectedDepartmentId") && watch("selectedDepartmentId").length > 0) {
            const filteredGroups = {};
            watch("selectedDepartmentId").forEach(id => {
                const dept = department.find(d => d.id === id);
                if (dept && allDepartments[dept.title]) {
                    filteredGroups[dept.title] = allDepartments[dept.title];
                }
            });
            return filteredGroups;
        }

        // Otherwise, return all grouped departments
        return allDepartments;
    }, [row, watch("selectedDepartmentId"), department]);

    const calculateTotals = (dataToSum) => {
        const basicSalary = dataToSum.reduce((sum, item) => sum + (item.basicSalary || 0), 0);
        const otAmount = dataToSum.reduce((sum, item) => sum + (item.otAmount || 0), 0);
        const totalAllowance = dataToSum.reduce((sum, item) => sum + (item.totalAllowance || 0), 0);
        const totalEarnings = dataToSum.reduce((sum, item) => sum + (item.totalEarnings || 0), 0);
        const totalPfAmount = dataToSum.reduce((sum, item) => sum + (item.totalPfAmount || 0), 0);
        const ptAmount = dataToSum.reduce((sum, item) => sum + (item.ptAmount || 0), 0);
        const deduction = dataToSum.reduce((sum, item) => sum + (item.deduction || 0), 0);
        const otherDeductions = dataToSum.reduce((sum, item) => sum + (item.otherDeductions || 0), 0);
        const totalDeductions = dataToSum.reduce((sum, item) => sum + (item.totalDeductions || 0), 0);
        const netSalary = dataToSum.reduce((sum, item) => sum + (item.netSalary || 0), 0);
        return { basicSalary, otAmount, totalAllowance, totalEarnings, totalPfAmount, ptAmount, deduction, otherDeductions, totalDeductions, netSalary };
    };

    const groupedDepartmentTotals = useMemo(() => {
        if (groupedDataForDisplay) {
            const departmentTotals = {};
            for (const deptName in groupedDataForDisplay) {
                departmentTotals[deptName] = calculateTotals(groupedDataForDisplay[deptName]);
            }
            return departmentTotals;
        }
        return null;
    }, [groupedDataForDisplay]);

    const createDataGridTotalRow = (totals, idPrefix) => {
        const uniqueId = `${idPrefix}-total-row`;
        return {
            id: uniqueId, // DataGrid requires an 'id' field
            rowId: 'Total', // This will appear in the '#' column
            employeeName: null, // This will appear in the 'Employee Name' column
            basicSalary: totals.basicSalary,
            otAmount: totals.otAmount,
            totalAllowance: totals.totalAllowance,
            totalEarnings: totals.totalEarnings,
            totalPfAmount: totals.totalPfAmount,
            ptAmount: totals.ptAmount,
            deduction: totals.deduction,
            otherDeductions: totals.otherDeductions || 0, // Ensure this field exists
            totalDeductions: totals.totalDeductions,
            netSalary: totals.netSalary,
            isTotalRow: true, // Custom flag to identify this row for styling in DataGrid
        };
    };

    const columns = useMemo(() => {
        const baseColumns = [
            { field: 'employeeName', headerName: 'Employee Name', headerClassName: 'uppercase', flex: 1, maxWidth: 180, sortable: false, disableColumnMenu: true },
            {
                field: 'basicSalary', headerName: 'Basic Salary', headerClassName: 'uppercase', flex: 1, maxWidth: 150,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.row?.basicSalary ? params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 }) : 0}</span>
            },
            {
                field: 'otAmount', headerName: 'OT (₹)', headerClassName: 'uppercase', flex: 1, maxWidth: 120,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'totalAllowance', headerName: 'Total Allowance', headerClassName: 'uppercase', flex: 1, maxWidth: 180,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'totalEarnings', headerName: 'Total Earnings', headerClassName: 'uppercase', flex: 1, maxWidth: 200,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'totalPfAmount', headerName: 'PF (₹)', headerClassName: 'uppercase', flex: 1, maxWidth: 120,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'ptAmount', headerName: 'PT (₹)', headerClassName: 'uppercase', flex: 1, maxWidth: 120,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'deduction', headerName: 'Deduction', headerClassName: 'uppercase', flex: 1, maxWidth: 150,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'otherDeductions', headerName: 'Other Deductions', headerClassName: 'uppercase', flex: 1, maxWidth: 200,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'totalDeductions', headerName: 'Total Deductions', headerClassName: 'uppercase', flex: 1, maxWidth: 200,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
            {
                field: 'netSalary', headerName: 'Net Salary', headerClassName: 'uppercase', flex: 1, maxWidth: 180,
                sortable: false,
                align: "right", headerAlign: "right", renderCell: (params) => <span>₹{params.value?.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
            },
        ];
        return baseColumns;
    }, [row]);


    const getRowIdForDataGrid = (rowItem) => rowItem.id;

    const actionButtons = () => {
        return (
            <div className='flex justify-start items-center gap-3'>
                <PermissionWrapper
                    functionalityName="Company"
                    moduleName="Salary Statement"
                    actionId={1}
                    component={
                        <Button type={`button`} text={'Generate & Save Salary'} disabled={row?.length === 0} onClick={() => handleOpenSalaryDialog()} startIcon={<CustomIcons iconName="fa-solid fa-file" css={`h-5 w-5 ${row?.length === 0 ? "cursor-not-allowed" : "cursor-pointer"}`} />} />
                    }
                />
            </div>
        );
    };

    return (
        <>
            <div className='py-2 px-4 lg:p-4 border rounded-lg bg-white'>
                <div className='grid grid-col-12 md:grid-cols-5 gap-3 items-center'>
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

                    <div className='mb-4 w-full md:mb-0'>
                        <DatePickerComponent setValue={setValue} control={control} name='startDate' label={`Start Date`} minDate={null} maxDate={watch("endDate")} />
                    </div>

                    <DatePickerComponent
                        setValue={setValue}
                        control={control}
                        name="endDate"
                        label="End Date"
                        minDate={watch("startDate")}
                        maxDate={new Date()}
                    />


                    <div>
                        <Controller
                            name="selectedUserId"
                            control={control}
                            render={({ field }) => (
                                <SelectMultiple
                                    options={users}
                                    label={"Select Employees"}
                                    placeholder="Select employees"
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

                <div className="mt-4">
                    {groupedDataForDisplay && Object.keys(groupedDataForDisplay).length > 0 ? (
                        <div>
                            <div className="mb-4 flex justify-end">
                                {actionButtons()}
                            </div>
                            {Object.entries(groupedDataForDisplay).map(([departmentName, employees]) => {
                                // Filter columns: remove 'departmentName' from the grouped tables
                                const departmentTableColumns = columns.filter(col => col.field !== 'departmentName');
                                const departmentTotal = groupedDepartmentTotals[departmentName];

                                return (
                                    <div key={departmentName} className="mb-6 border p-4 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-700 capitalize">{departmentName.toLocaleLowerCase().endsWith("department") ? departmentName : `${departmentName} department`}</h3>
                                        <DataTable
                                            columns={departmentTableColumns}
                                            rows={employees}
                                            getRowId={getRowIdForDataGrid}
                                            height={employees.length > 0 ? 350 : 150} // Adjust height dynamically
                                            showButtons={false} // No individual buttons for department tables
                                            footerRowData={employees.length > 0 ? createDataGridTotalRow(departmentTotal, departmentName) : null}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={row} // This will be empty
                            getRowId={getRowIdForDataGrid}
                            height={550}
                            showButtons={true}
                            buttons={actionButtons}
                            footerRowData={null} // No total row if no data
                        />
                    )}
                </div>
            </div>
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleSaveSalary} handleClose={handleCloseSalaryDialog} loading={loading} note={`This action will save salary statements for all employees and departments for the month of ${filter?.title}-${selectedYear}.`} />

        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(GenerateSalary)