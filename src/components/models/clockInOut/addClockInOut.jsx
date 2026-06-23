import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import { addClockInOut, getUserInOutRecord } from '../../../service/userInOut/userInOut';
import InputTimePicker from '../../common/inputTimePicker/inputTimePicker';
import { apiToLocalTime } from '../../../service/common/commonService';
import DatePickerComponent from '../../common/datePickerComponent/datePickerComponent';

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
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

export function AddClockInOut({ open, handleClose, employeeList, getRecords, id }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))

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
            date: new Date()
        },
    });

    const onClose = () => {
        reset({
            timeIn: null,
            timeOut: null,
            userId: null,
        });
        setLoading(false);
        handleClose();
    };

    const submit = async (data) => {
        const mergedTimeIn = combineDateAndTime(data.date, data.timeIn);
        const mergedTimeOut = combineDateAndTime(data.date, data.timeOut);

        let newData = {
            ...data,
            companyId: userInfo?.companyId,
            timeIn: mergedTimeIn ? mergedTimeIn.utc().toISOString() : null,
            timeOut: mergedTimeOut ? mergedTimeOut.utc().toISOString() : null,
            createdOn: data.date
        };

        setLoading(true);
        try {
            const response = await addClockInOut(newData);
            if (response?.data?.status === 201) {
                setLoading(false);
                getRecords();
                onClose();
            } else {
                setLoading(false);
                setAlert({
                    open: true,
                    message: response?.data?.message || "Failed to add clock in/out",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Error submitting clock in/out:", error);
            setLoading(false);
        }
    };


    const handleGetData = async () => {
        if (id && open) {
            const response = await getUserInOutRecord(id);
            if (response?.data?.status === 200) {
                const result = response.data?.result;
                reset({
                    ...result,
                    date: extractDateFromTimeIn(result?.timeIn),
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
                // onClose={onClose}
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
                                            field.onChange(newValue.id);
                                            if (newValue?.id) {
                                            } else {
                                                setValue("userId", null);
                                            }
                                        }}
                                        error={errors?.userId}
                                    />
                                )}
                            />
                            <div>
                                <DatePickerComponent setValue={setValue} control={control} name='date' label={`Date`} minDate={null} maxDate={new Date()} />
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
                                minTime={watch("timeIn")}
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

export default connect(null, mapDispatchToProps)(AddClockInOut)
