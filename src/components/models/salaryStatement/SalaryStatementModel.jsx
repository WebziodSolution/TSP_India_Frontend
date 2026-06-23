import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import { getHistory, updateSalaryStatement } from '../../../service/salaryStatementHistory/salaryStatementHistoryService';
import { getCompanyEmployee } from '../../../service/companyEmployee/companyEmployeeService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

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

function SalaryStatementModel({ setAlert, open, handleClose, id, handleGetStatements }) {

    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const [userData, setUserData] = useState(null);

    const {
        watch,
        setValue,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            id: "",
            companyId: "",
            employeeId: "",
            employeeName: "",
            departmentId: "",
            departmentName: "",
            basicSalary: "",
            otAmount: "",
            pfAmount: "",
            totalPfAmount: "",
            pfPercentage: "",
            ptAmount: "",
            totalEarnings: "",
            otherDeductions: "",
            totalDeductions: "",
            netSalary: "",
            month: "",
            totalDays: "",
            totalWorkingDays: "",
            totalWorkingHours: "",
            note: "",
        },
    });

    const onClose = () => {
        setLoading(false);
        setIsInitialLoading(true);
        setUserData(null);
        reset({
            id: "",
            companyId: "",
            employeeId: "",
            employeeName: "",
            departmentId: "",
            departmentName: "",
            basicSalary: "",
            otAmount: "",
            pfAmount: "",
            totalPfAmount: "",
            pfPercentage: "",
            ptAmount: "",
            totalEarnings: "",
            otherDeductions: "",
            totalDeductions: "",
            netSalary: "",
            month: "",
            totalDays: "",
            totalWorkingDays: "",
            totalWorkingHours: "",
        });
        handleClose();
    };

    const handleGetData = async () => {
        if (!id) return;
        setIsInitialLoading(true);
        setUserData(null);

        try {
            const response = await getHistory(id);
            if (response.data.status === 200) {
                const statementData = response.data.result;
                if (statementData?.employeeId) {
                    const res = await getCompanyEmployee(statementData.employeeId);
                    if (res.data.status === 200) {
                        setUserData(res.data.result);
                    } else {
                        setAlert({ message: res.data.message, type: 'error' });
                    }
                }
                reset(statementData);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
        } catch (error) {
            setAlert({ message: "Failed to fetch data", type: 'error' });
        } finally {
            setIsInitialLoading(false);
        }
    };

    const calculateSalaryStatement = () => {
        const basicSalary = parseInt(watch("basicSalary")) || 0;
        const totalPaidDays = parseInt(watch("totalPaidDays")) || 0;
        const totalWorkingDays = parseInt(watch("totalWorkingDays")) || 0;
        const otAmount = parseInt(watch("otAmount")) || 0;
        const ptAmount = parseInt(watch("ptAmount")) || 0;
        const otherDeductions = parseInt(watch("otherDeductions")) || 0;
        const totalPF = parseInt(watch("pfAmount")) || 0;

        // 1. Calculate Total Earnings
        let totalSalary = 0;
        if (userData?.hourlyRate && watch("totalWorkingHours") !== undefined && watch("totalWorkingHours") !== null) {
            const hourlyRate = parseFloat(userData.hourlyRate) || 0;
            const totalWorkingHours = parseFloat(watch("totalWorkingHours")) || 0;
            const hrs = Math.floor(totalWorkingHours);
            const mins = Math.round((totalWorkingHours - hrs) * 100);
            totalSalary = Math.round((hrs * hourlyRate) + (mins * hourlyRate / 60.0)) || 0;
        } else {
            const daySalary = parseInt(basicSalary / 30) || 0;
            const payDays = (totalWorkingDays + totalPaidDays) > 30 ? 30 : (totalWorkingDays + totalPaidDays);
            totalSalary = parseInt(daySalary * payDays) || 0;
        }
        const totalEarnings = otAmount + totalSalary;

        // 5. Calculate Final Deductions (including PF)
        const totalDeductions = totalPF + ptAmount + otherDeductions;

        // 6. Calculate Final Net Salary
        const netSalary = totalEarnings - totalDeductions;

        // 7. Update form values in a single batch
        setValue("totalEarnings", totalEarnings);
        // setValue("pfAmount", totalPF);
        setValue("totalPfAmount", totalPF);
        // setValue("pfPercentage", netSalaryBeforePF > 15000 ? null : pfPercentage);
        setValue("totalDeductions", totalDeductions);
        setValue("netSalary", netSalary);
    };

    useEffect(() => {
        if (isInitialLoading) return;
        calculateSalaryStatement();
    }, [
        isInitialLoading,
        userData,
        watch("basicSalary"),
        watch("totalPaidDays"),
        watch("totalWorkingDays"),
        watch("totalWorkingHours"),
        watch("otAmount"),
        watch("ptAmount"),
        watch("pfAmount"),
        watch("otherDeductions"),
    ]);

    useEffect(() => {
        handleGetData();
    }, [id])

    const submit = async (data) => {
        const newData = {
            ...data,
            employeeId: data.employeeId || userInfo.employeeId,
            companyId: data.companyId || userInfo.companyId,
            monthNumber: filterOptions?.find(option => option.title === data.monthYear?.split("-")[0])?.value || "",
            year: data.monthYear?.split("-")[1] || ""
        }
        if (id) {
            setLoading(true)
            const response = await updateSalaryStatement(id, newData);
            if (response?.data?.status === 200) {
                setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetStatements()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Update Salary Statement
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        {isInitialLoading ? (
                            <div className='flex justify-center items-center py-10'>
                                <CircularProgress />
                            </div>
                        ) : (
                            <>
                                <div className='grid grid-cols-6 mb-4 gap-4'>
                                    <div className='flex justify-start items-center gap-2 col-span-2'>
                                        <p>Employee Name :</p>
                                        <span className='font-semibold'>{watch("employeeName")}</span>
                                    </div>
                                    {
                                        userData?.hourlyRate ? (
                                            <div className='flex justify-start items-center gap-2 col-span-2'>
                                                <p>Hourly Rate :</p>
                                                <span className='font-semibold'>₹{(parseFloat(userData?.hourlyRate) || 0).toLocaleString("en-IN")}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className='flex justify-start items-center gap-2 col-span-2'>
                                                    <p>Basic Salary :</p>
                                                    <span className='font-semibold'>₹{(parseInt(watch("basicSalary")) || 0).toLocaleString("en-IN")}</span>
                                                </div>
                                                <div className='flex justify-start items-center gap-2 col-span-2'>
                                                    <p>Total Paid Days :</p>
                                                    <span className='font-semibold'>{watch("totalPaidDays") || 0}</span>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>

                                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                    {
                                        watch("totalWorkingHours") !== null ? (
                                            <Controller
                                                name="totalWorkingHours"
                                                control={control}
                                                rules={{
                                                    required: "Working hours is required",
                                                }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Working Hours"
                                                        type="text"
                                                        error={errors.totalWorkingHours}
                                                        onChange={(e) => {
                                                            let value = e.target.value;

                                                            // 1. Remove any character that isn't a digit or a dot
                                                            value = value.replace(/[^0-9.]/g, '');

                                                            // 2. Prevent multiple dots (keep only the first one)
                                                            const parts = value.split('.');
                                                            if (parts.length > 2) {
                                                                value = parts[0] + '.' + parts.slice(1).join('');
                                                            }

                                                            // 3. Limit to 2 digits after the dot
                                                            if (parts[1] && parts[1].length > 2) {
                                                                value = parts[0] + '.' + parts[1].substring(0, 2);
                                                            }

                                                            field.onChange(value);
                                                        }}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <Controller
                                                name="totalWorkingDays"
                                                control={control}
                                                rules={{
                                                    required: "Working days is required",
                                                }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Working Days"
                                                        type="text"
                                                        error={errors.totalWorkingDays}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                                            if (parseInt(value) > parseInt(31)) {
                                                                return;
                                                            } else {
                                                                field.onChange(value);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        )
                                    }
                                    <Controller
                                        name="otAmount"
                                        control={control}
                                        rules={{
                                            required: "OT amount is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="OT Amount"
                                                type={`text`}
                                                error={errors.otAmount}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    field.onChange(value);
                                                }}
                                                endIcon={<CustomIcons iconName={`fa-solid fa-indian-rupee-sign`} css={'text-gray-500'} />}
                                            />
                                        )}
                                    />
                                    {
                                        watch("pfAmount") !== null && (
                                            <Controller
                                                name="pfAmount"
                                                control={control}
                                                rules={{
                                                    required: "PF amount is required",
                                                }}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="PF Amount"
                                                        type={`text`}
                                                        error={errors.pfAmount}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                                            field.onChange(value);
                                                        }}
                                                        // disabled={true}
                                                        endIcon={<CustomIcons iconName={`fa-solid fa-indian-rupee-sign`} css={'text-gray-500'} />}
                                                    />
                                                )}
                                            />
                                        )
                                    }
                                    {
                                        (watch("pfPercentage") !== null || watch("pfAmount") !== null) ? (
                                            <Input
                                                label="Total PF Amount"
                                                type={`text`}
                                                value={watch("totalPfAmount")}
                                                disabled
                                                endIcon={<CustomIcons iconName={`fa-solid fa-indian-rupee-sign`} css={'text-gray-500'} />}
                                            />
                                        ) : null
                                    }
                                    <Controller
                                        name="ptAmount"
                                        control={control}
                                        rules={{
                                            required: "PT amount is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="PT Amount"
                                                type={`text`}
                                                error={errors.ptAmount}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    field.onChange(value);
                                                }}
                                                endIcon={<CustomIcons iconName={`fa-solid fa-indian-rupee-sign`} css={'text-gray-500'} />}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="otherDeductions"
                                        control={control}
                                        rules={{
                                            required: "Other deductions is required",
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Other Deductions"
                                                type={`text`}
                                                error={errors.otherDeductions}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    field.onChange(value);
                                                }}
                                                endIcon={<CustomIcons iconName={`fa-solid fa-indian-rupee-sign`} css={'text-gray-500'} />}
                                            />
                                        )}
                                    />
                                </div>

                                <div className='flex justify-start items-center my-2 gap-5'>
                                    <div className='flex justify-start items-center gap-2'>
                                        <p>Total Earnings :</p>
                                        <span className='font-semibold'>₹{(parseInt(watch("totalEarnings")) || 0).toLocaleString("en-IN")}</span>
                                    </div>

                                    <div className='flex justify-start items-center gap-2'>
                                        <p>Total Deductions :</p>
                                        <span className='font-semibold'>₹{(parseInt(watch("totalDeductions")) || 0).toLocaleString("en-IN")}</span>
                                    </div>

                                    <div className='flex justify-start items-center gap-2'>
                                        <p>Net Salary :</p>
                                        <span className='font-semibold'>₹{(parseInt(watch("netSalary")) || 0).toLocaleString("en-IN")}</span>
                                    </div>
                                </div>

                                <div className='flex justify-start items-center my-2 gap-5'>
                                    <Controller
                                        name="note"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Note"
                                                type="text"
                                                multiline={true}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                            </>
                        )}
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={"Submit"} isLoading={loading} disabled={isInitialLoading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment >
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(SalaryStatementModel)