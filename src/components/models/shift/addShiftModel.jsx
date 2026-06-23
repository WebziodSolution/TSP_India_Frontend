import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import Select from '../../common/select/select';
import CustomIcons from '../../common/icons/CustomIcons';
import { createShift, getShift, updateShift } from '../../../service/companyShift/companyShiftService';
import dayjs from 'dayjs';
import InputTimePicker from '../../common/inputTimePicker/inputTimePicker';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const type = [
    {
        id: 1,
        title: "Hourly",
    },
    {
        id: 2,
        title: "Time Based",
    }
]

function AddShiftModel({ setAlert, open, handleClose, shiftId, handleGetAllShifts }) {

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
            id: "",
            companyId: "",
            shiftName: "",
            shiftType: "",
            shiftTypeId: "",
            startTime: null,
            endTime: null,
            hours: "",
            totalHours: 0,           
        },
    });

    const onClose = () => {
        reset({
            id: "",
            companyId: "",
            shiftName: "",
            shiftType: "",
            shiftTypeId: "",
            startTime: null,
            endTime: null,
            hours: "",
            totalHours: 0,         
        });
        handleClose();
    };

    const submit = async (data) => {
        const payload = {
            ...data,
            companyId: userInfo?.companyId,
            totalHours: parseFloat(data.totalHours) || 0,
            startTime: data.startTime
                ? new Date(data.startTime).toISOString()
                : null,
            endTime: data.endTime
                ? new Date(data.endTime).toISOString()
                : null,
        };

        if (shiftId) {
            const response = await updateShift(shiftId, payload)
            if (response.data.status === 200) {
                handleGetAllShifts()
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: response.data.message,
                    type: "error",
                })
            }
        } else {
            const response = await createShift(payload)
            if (response.data.status === 201) {
                handleGetAllShifts()
                onClose()
            } else {
                setAlert({
                    open: true,
                    message: response.data.message,
                    type: "error",
                })
            }
        }
    }

    const handleGetShift = async () => {
        if (open && shiftId) {
            const response = await getShift(shiftId)
            if (response.data.status === 200) {
                const result = response.data.result;
                setValue("shiftName", result?.shiftName);
                setValue("shiftType", result?.shiftType);
                setValue("shiftTypeId", type?.find(item => item.title === result?.shiftType)?.id);
                if (result?.startTime) {
                    setValue("startTime", dayjs(result?.startTime))
                }
                if (result?.endTime) {
                    setValue("endTime", dayjs(result?.endTime))
                }
                setValue("hours", result?.hours);
                setValue("totalHours", parseFloat(result?.totalHours) || 0);

            }
        }
    }

    useEffect(() => {
        handleGetShift()
    }, [open, shiftId])

    useEffect(() => {
        if (watch("startTime") && watch("endTime")) {
            const start = dayjs(watch("startTime"));
            const end = dayjs(watch("endTime"));

            let diff = end.diff(start, "minute");

            if (diff < 0) {
                diff += 24 * 60;
            }

            const hours = Math.floor(diff / 60);
            const minutes = diff % 60;

            const total = `${hours}.${minutes.toString().padStart(2, '0')}`;
            setValue("totalHours", isNaN(total) ? 0.00 : parseFloat(total));
        }
        else {
            if (!watch("hours")) {
                setValue("totalHours", 0);
            }
        }
    }, [watch("startTime"), watch("endTime")]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {shiftId ? "Update" : "Add"} Shift
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
                        <div className='grid md:grid-cols-4 gap-3'>
                            <div>
                                <Controller
                                    name="shiftName"
                                    control={control}
                                    rules={{
                                        required: "Shift name is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Shift name"
                                            type={`text`}
                                            error={errors.shiftName}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="shiftTypeId"
                                    control={control}
                                    rules={{ required: "Shift Type is required" }}
                                    render={({ field }) => (
                                        <Select
                                            options={type}
                                            error={!!errors.shiftTypeId}
                                            label="Shift Type"
                                            placeholder="Select type"
                                            value={parseInt(watch("shiftTypeId")) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue?.id || null);
                                                setValue("shiftType", newValue?.title || null);
                                                setValue("shiftTypeId", newValue?.id || null);
                                                if (newValue?.title === "Hourly") {
                                                    setValue("startTime", null);
                                                    setValue("endTime", null);                                                  
                                                } else if (newValue?.title === "Time Based") {
                                                    setValue("hours", 0);
                                                } else {
                                                    setValue("hours", 0);
                                                    setValue("startTime", null);
                                                    setValue("endTime", null);
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="hours"
                                    control={control}
                                    rules={{
                                        required: watch("shiftTypeId") === 1 ? "Hours is required" : null,
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Shift Hours"
                                            type="text"
                                            error={errors.hours}
                                            value={field.value}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Allow only numbers and one decimal point
                                                value = value.replace(/[^0-9.]/g, '');

                                                // Prevent multiple dots
                                                const parts = value.split('.');
                                                if (parts.length > 2) {
                                                    value = parts[0] + '.' + parts[1];
                                                }

                                                // Limit to 2 decimal places
                                                if (parts[1]?.length > 2) {
                                                    value = parts[0] + '.' + parts[1].slice(0, 2);
                                                }

                                                field.onChange(value);
                                                setValue("totalHours", value);
                                            }}
                                            disabled={watch("shiftTypeId") !== 1}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <InputTimePicker
                                    label="Start Time"
                                    name="startTime"
                                    control={control}
                                    disabled={watch("shiftTypeId") !== 2 ? true : false}
                                    rules={{
                                        required: watch("shiftTypeId") === 2 ? "Start time is required" : null,
                                    }}
                                    maxTime={watch("endTime")}
                                />
                            </div>

                            <div>
                                <InputTimePicker
                                    label="End Time"
                                    name="endTime"
                                    control={control}
                                    disabled={watch("shiftTypeId") !== 2 ? true : false}
                                    rules={{
                                        required: watch("shiftTypeId") === 2 ? "End time is required" : null,
                                    }}
                                    minTime={watch("startTime")}
                                />
                            </div>

                            <div>
                                <Controller
                                    name="totalHours"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Total hours"
                                            type={`text`}
                                            disabled={true}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={shiftId ? "Update" : "Submit"} />
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

export default connect(null, mapDispatchToProps)(AddShiftModel)
