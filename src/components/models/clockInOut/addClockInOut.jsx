import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { setAlert as setAlertAction } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { addClockInOut, getUserInOutRecord } from '../../../service/userInOut/userInOut';
import InputTimePicker from '../../common/inputTimePicker/inputTimePicker';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

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
    if (d.isValid()) return d.format(DISPLAY_DATE_FORMAT);

    const fallback = dayjs(timeIn);
    if (fallback.isValid()) return fallback.format(DISPLAY_DATE_FORMAT);

    return null;
};

const parseLocalTime = (timeStr) => {
    if (!timeStr) return null;
    let d = dayjs(timeStr, API_DATETIME_FORMATS, true);
    if (d.isValid()) return d;
    d = dayjs(timeStr);
    return d.isValid() ? d : null;
};

const toDayjsDate = (val) => {
    if (!val) return null;
    if (dayjs.isDayjs(val)) return val;
    if (val instanceof Date) return dayjs(val);
    if (typeof val === "string") {
        let d = dayjs(val, DISPLAY_DATE_FORMAT, true);
        if (d.isValid()) return d;
        d = dayjs(val, API_DATETIME_FORMATS, true);
        if (d.isValid()) return d;
        d = dayjs(val);
        if (d.isValid()) return d;
    }
    const d = dayjs(val);
    return d.isValid() ? d : null;
};

const getDateIso = (val) => {
    if (!val) return new Date().toISOString();
    if (val instanceof Date) return val.toISOString();
    const d = toDayjsDate(val);
    return d && d.isValid() ? d.toISOString() : new Date().toISOString();
};

const combineDateAndTime = (dateVal, timeVal) => {
    if (!dateVal || !timeVal) return null;

    const d = toDayjsDate(dateVal);
    const t = dayjs.isDayjs(timeVal) ? timeVal : dayjs(timeVal);

    if (!d || !d.isValid() || !t || !t.isValid()) return null;

    // Merge: date from d, time from t
    return d
        .hour(t.hour())
        .minute(t.minute())
        .second(t.second() || 0)
        .millisecond(0);
};

export function AddClockInOut({ open, handleClose, employeeList, getRecords, id, setAlert }) {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const showAlert = (alertObj) => {
        if (typeof setAlert === "function") {
            setAlert(alertObj);
        } else {
            dispatch(setAlertAction(alertObj));
        }
    };

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
            userId: "",
            date: new Date(),
            clockOutDate: new Date(),
        },
    });

    const clockInDateWatch = watch("date");
    const clockOutDateWatch = watch("clockOutDate");

    // If clockOutDate is not set or earlier than clockInDate, adjust clockOutDate
    useEffect(() => {
        if (clockInDateWatch) {
            const inDate = toDayjsDate(clockInDateWatch);
            const outDate = toDayjsDate(clockOutDateWatch);
            if (!outDate || (inDate && outDate.isBefore(inDate, 'day'))) {
                setValue("clockOutDate", clockInDateWatch);
            }
        }
    }, [clockInDateWatch]);

    const isSameDay = () => {
        const d1 = toDayjsDate(clockInDateWatch);
        const d2 = toDayjsDate(clockOutDateWatch);
        if (!d1 || !d2) return true;
        return d1.isSame(d2, 'day');
    };

    const onClose = () => {
        reset({
            timeIn: null,
            timeOut: null,
            userId: null,
            date: new Date(),
            clockOutDate: new Date(),
        });
        setLoading(false);
        handleClose();
    };

    const submit = async (data) => {
        const clockInDateVal = data.date;
        const clockOutDateVal = data.clockOutDate || data.date;

        const mergedTimeIn = combineDateAndTime(clockInDateVal, data.timeIn);
        const mergedTimeOut = combineDateAndTime(clockOutDateVal, data.timeOut);

        if (mergedTimeIn && mergedTimeOut && (mergedTimeOut.isBefore(mergedTimeIn) || mergedTimeOut.isSame(mergedTimeIn))) {
            showAlert({
                open: true,
                message: "Clock out time must be after clock in time",
                type: "error",
            });
            return;
        }

        const dateIso = getDateIso(clockInDateVal);

        let newData = {
            ...data,
            companyId: userInfo?.companyId,
            timeIn: mergedTimeIn ? mergedTimeIn.utc().toISOString() : null,
            timeOut: mergedTimeOut ? mergedTimeOut.utc().toISOString() : null,
            date: dateIso,
            createdOn: dateIso
        };

        delete newData.clockOutDate;
        if (id) {
            newData.id = id;
        }

        setLoading(true);
        try {
            const response = await addClockInOut(newData);
            if (response?.data?.status === 201 || response?.data?.status === 200) {
                setLoading(false);
                getRecords();
                onClose();
            } else {
                setLoading(false);
                showAlert({
                    open: true,
                    message: response?.data?.message || "Failed to add clock in/out",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Error submitting clock in/out:", error);
            setLoading(false);
            showAlert({
                open: true,
                message: error?.response?.data?.message || "Error submitting clock in/out",
                type: "error",
            });
        }
    };

    const handleGetData = async () => {
        if (id && open) {
            const response = await getUserInOutRecord(id);
            if (response?.data?.status === 200) {
                const result = response.data?.result;
                const inDate = extractDateFromTimeIn(result?.timeIn);
                const outDate = extractDateFromTimeIn(result?.timeOut) || inDate;
                reset({
                    ...result,
                    date: inDate,
                    clockOutDate: outDate,
                    timeIn: parseLocalTime(result?.timeIn),
                    timeOut: parseLocalTime(result?.timeOut)
                });
            }
        }
    };

    useEffect(() => {
        handleGetData();
    }, [open]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {id ? `Edit Clock In/Out` : `Add Clock In/Out`}
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
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='col-span-2'>
                                <Controller
                                    name="userId"
                                    control={control}
                                    rules={{ required: "Employee is required" }}
                                    render={({ field }) => (
                                        <Select
                                            options={employeeList || []}
                                            label={"Employee List"}
                                            placeholder="Select employees"
                                            value={parseInt(watch("userId")) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue?.id || null);
                                                if (!newValue?.id) {
                                                    setValue("userId", null);
                                                }
                                            }}
                                            error={errors?.userId}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <DatePickerComponent
                                    setValue={setValue}
                                    control={control}
                                    name='date'
                                    label={`Clock In Date`}
                                    minDate={null}
                                    maxDate={new Date()}
                                />
                            </div>
                            <InputTimePicker
                                label="Clock In Time"
                                name="timeIn"
                                control={control}
                                rules={{
                                    required: "Clock in time is required",
                                }}
                                maxTime={isSameDay() ? watch("timeOut") : undefined}
                            />
                            <div>
                                <DatePickerComponent
                                    setValue={setValue}
                                    control={control}
                                    name='clockOutDate'
                                    label={`Clock Out Date`}
                                    minDate={watch("date")}
                                    maxDate={new Date()}
                                />
                            </div>
                            <InputTimePicker
                                label="Clock Out Time"
                                name="timeOut"
                                control={control}
                                minTime={isSameDay() ? watch("timeIn") : undefined}
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
    setAlert: setAlertAction,
};

export default connect(null, mapDispatchToProps)(AddClockInOut);

