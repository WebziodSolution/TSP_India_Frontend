import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { addBulkClockInOut, getUserInOutRecord } from '../../../service/userInOut/userInOut';
import InputTimePicker from '../../common/inputTimePicker/inputTimePicker';
import { apiToLocalTime } from '../../../service/common/commonService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getAllEmployeeListByCompanyId } from '../../../service/companyEmployee/companyEmployeeService';
import SelectMultiple from '../../common/select/selectMultiple';
import CheckBoxSelect from '../../common/select/checkBoxSelect';
dayjs.extend(customParseFormat);

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const API_DATETIME_FORMATS = [
    "DD/MM/YYYY, hh:mm:ss A",
    "MM/DD/YYYY, hh:mm:ss A"
];

const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

const extractDateFromTimeIn = (timeIn) => {
    if (!timeIn) return null;

    const d = dayjs(timeIn, API_DATETIME_FORMATS, true);
    if (!d.isValid()) return null;

    return d.format(DISPLAY_DATE_FORMAT); // 👉 "31/12/2025"
};

const parseLocalTime = (timeStr) => {
    if (!timeStr) return null;
    const d = dayjs(timeStr, API_DATETIME_FORMATS, true);
    return d.isValid() ? d : null;
};

const combineDateAndTime = (dateVal, timeVal) => {
    if (!dateVal || !timeVal) return null;

    // Normalize date -> dayjs
    let d;
    if (dayjs.isDayjs(dateVal)) d = dateVal;
    else if (dateVal instanceof Date) d = dayjs(dateVal);
    else if (typeof dateVal === "string") d = dayjs(dateVal, DISPLAY_DATE_FORMAT, true);
    else d = dayjs(dateVal);

    // Normalize time -> dayjs
    const t = dayjs.isDayjs(timeVal) ? timeVal : dayjs(timeVal);

    if (!d.isValid() || !t.isValid()) return null;

    // Merge: date from d, time from t
    return d
        .hour(t.hour())
        .minute(t.minute())
        .second(t.second() || 0)
        .millisecond(0);
};

export function BulkClockInOut({ open, handleClose, getRecords }) {
    const theme = useTheme()

    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const companyId = userInfo?.companyId
    const [employeeList, setEmployeeList] = useState([])
    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            timeIn: null,
            timeOut: null,
            userId: [],
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
        },
    });

    const onClose = () => {
        reset({
            timeIn: null,
            timeOut: null,
            userId: [],
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
        });
        handleClose();
    };

    const handleGetAllEmployees = async () => {
        if (open && companyId) {
            const res = await getAllEmployeeListByCompanyId(companyId)
            if (res?.data?.status === 200) {
                const data = res.data?.result
                setEmployeeList(data?.map((item) => ({
                    title: item.userName,
                    id: item.employeeId,
                })))
                setLoading(false)
            }
        }
    }

    const submit = async (data) => {
        setLoading(true)
        const payload = {
            ...data,
            companyId
        }
        const res = await addBulkClockInOut(payload)
        if (res?.data?.status === 201) {
            setAlert({ open: true, message: "Clock In/Out added successfully", type: "success" })
            onClose()
            getRecords()
        } else {
            setLoading(false)
            setAlert({ open: true, message: res?.data?.message, type: "error" })
        }
    };

    useEffect(() => {
        handleGetAllEmployees();
    }, [open]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                // onClose={onClose}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {`Add Clock In/Out`}
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                    disabled={loading}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <DatePickerComponent setValue={setValue} control={control} name='startDate' label={`Start Date`} minDate={null} maxDate={watch("endDate")} />
                            </div>
                            <div>
                                <DatePickerComponent setValue={setValue} control={control} name='endDate' label={`End Date`} minDate={watch("startDate")} maxDate={new Date()} />
                            </div>
                            <InputTimePicker
                                label="Clock In Time"
                                name="timeIn"
                                control={control}
                                rules={{
                                    required: "Clock in time is required",
                                }}
                                maxTime={watch("timeOut")}
                            />
                            <InputTimePicker
                                label="Clock Out Time"
                                name="timeOut"
                                control={control}
                                rules={{
                                    required: "Clock out time is required",
                                }}
                                minTime={watch("timeIn")}
                            />
                        </div>
                        <div className='mt-4'>
                            <Controller
                                name="userId"
                                control={control}
                                rules={{
                                    required: true
                                }}
                                render={({ field }) => {
                                    const selectedOptions = employeeList?.filter((emp) =>
                                        (field.value || []).includes(emp.id)
                                    );

                                    return (
                                        <CheckBoxSelect
                                            options={employeeList}
                                            label="Select Employees"
                                            placeholder="Select employees"
                                            value={selectedOptions}
                                            onChange={(event, newValue) => {
                                                const newIds = newValue?.map((opt) => opt.id);
                                                field.onChange(newIds);
                                            }}
                                            checkAll={true}
                                            disabled={employeeList?.length === 0}
                                            error={!!errors?.userId}
                                        />
                                    );
                                }}
                            />
                        </div>
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={"Submit"} isLoading={loading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(BulkClockInOut)
