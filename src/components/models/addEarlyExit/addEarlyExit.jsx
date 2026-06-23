import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import {
    createAttendancePenaltyRule,
    getAttendancePenaltyRuleById,
    updateAttendancePenaltyRule
} from '../../../service/attendancePenaltyRules/attendancePenaltyRuleService';
import Select from '../../common/select/select';
import TimeSelector from '../../common/timeSelector/timeSelector';
import AlertDialog from '../../common/alertDialog/alertDialog';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const attendancePenaltyRuleTypes = [
    { id: 1, title: "Fixed Amount" },
    { id: 2, title: "Half Day Salary" },
    { id: 3, title: "5 Min Salary" },
    { id: 4, title: "15 Min Salary" },
    { id: 5, title: "30 Min Salary" },
    { id: 6, title: "1 Hour Salary" },
    { id: 7, title: "1 Day Salary" },
    { id: 8, title: "1.5 Day Salary" },
    { id: 9, title: "2 Day Salary" },
    { id: 10, title: "2.5 Day Salary" },
    { id: 11, title: "3 Day Salary" }
];

function AddEarlyExit({ setAlert, open, handleClose, id, handleAttendancePenaltyRule }) {
    const theme = useTheme();

    const [loading, setLoading] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // ✅ Confirm dialog state (same pattern as overtime rule)
    const [pendingData, setPendingData] = useState(null);
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        actionButtonText: ''
    });

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            ruleName: "",
            amount: "",
            deductionType: 1,
            count: 0,
            hours: 0,
            minutes: 0,
            totalMinutes: 0,
        },
    });

    const handleOpenDialog = () => {
        setDialog({
            open: true,
            title: 'Update Rule Warning',
            message: 'Updating this rule will affect salary calculations. Are you sure you want to proceed?',
            actionButtonText: 'Yes'
        });
    };

    const handleCloseDialog = () => {
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setPendingData(null);
        setLoading(false);
    };

    const onClose = () => {
        setLoading(false);
        setPendingData(null);
        handleCloseDialog();
        reset({
            ruleName: "",
            amount: "",
            deductionType: 1,
            count: 0,
            hours: 0,
            minutes: 0,
            totalMinutes: 0,
        });
        handleClose();
    };

    // ✅ Create/Update submit (Update opens dialog first)
    const submit = async (data) => {
        const newData = {
            ...data,
            companyId: userInfo?.companyId,
            createdBy: userInfo?.employeeId,
            deductionType: attendancePenaltyRuleTypes.find(type => type.id === data.deductionType)?.title || "",
            amount: parseInt(data.deductionType, 10) === 1 ? data.amount : null,
            isEarlyExit: true,
            minutes: parseInt(data.totalMinutes, 10) || 0,
        };

        // CREATE -> direct API call
        if (!id) {
            setLoading(true);
            const response = await createAttendancePenaltyRule(newData);
            if (response?.data?.status === 201) {
                handleAttendancePenaltyRule();
                onClose();
            } else {
                setAlert({ open: true, message: response?.data?.message || "Failed to create rule", type: 'error' });
                setLoading(false);
            }
            return;
        }

        // UPDATE -> store payload + open confirm dialog
        setPendingData(newData);
        handleOpenDialog();
    };

    // ✅ Called when user clicks YES in AlertDialog
    const handleConfirmUpdate = async () => {
        if (!id || !pendingData) return;

        setLoading(true);
        const response = await updateAttendancePenaltyRule(id, pendingData);

        if (response?.data?.status === 200) {
            handleCloseDialog();
            handleAttendancePenaltyRule();
            onClose();
        } else {
            setAlert({ open: true, message: response?.data?.message || "Failed to update rule", type: 'error' });
            setLoading(false);
        }
    };

    const handleGetAttendancePenaltyRuleById = async () => {
        if (id != null && open) {
            const response = await getAttendancePenaltyRuleById(id);
            if (response?.data?.status === 200) {
                const totalMinutes = parseInt(response?.data?.result?.minutes || 0, 10);
                const hrs = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;

                reset({
                    id: response?.data?.result?.id || "",
                    ruleName: response?.data?.result?.ruleName || "",
                    amount: response?.data?.result?.amount || "",
                    deductionType:
                        attendancePenaltyRuleTypes.find(type => type.title === response?.data?.result?.deductionType)?.id || 1,
                    count: response?.data?.result?.count || "",
                    totalMinutes: totalMinutes,
                    hours: hrs,
                    minutes: mins,
                });
            } else {
                setAlert({ open: true, message: response?.data?.message || "Failed to fetch rule", type: 'error' });
            }
        }
    };

    useEffect(() => {
        const hrs = watch("hours") || 0;
        const mins = watch("minutes") || 0;

        const totalMins = hrs * 60 + mins;
        setValue("totalMinutes", totalMins.toString());
    }, [watch("hours"), watch("minutes"), setValue, watch]);

    useEffect(() => {
        handleGetAttendancePenaltyRuleById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {id ? "Update" : "Create"} Early Exit Rule
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
                        <div className='grid grid-cols-3 gap-4'>
                            <Controller
                                name="ruleName"
                                control={control}
                                rules={{ required: "Rule name is required" }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Rule Name"
                                        type="text"
                                        error={errors.ruleName}
                                        onChange={(e) => field.onChange(e)}
                                    />
                                )}
                            />

                            <Controller
                                name="deductionType"
                                control={control}
                                rules={{ required: "Deduction Type is required" }}
                                render={({ field }) => (
                                    <Select
                                        options={attendancePenaltyRuleTypes}
                                        error={!!errors.deductionType}
                                        label="Deduction Type"
                                        placeholder="Select type"
                                        value={parseInt(watch("deductionType"), 10) || null}
                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                    />
                                )}
                            />

                            {parseInt(watch("deductionType"), 10) === 1 && (
                                <Controller
                                    name="amount"
                                    control={control}
                                    rules={{
                                        required: parseInt(watch("deductionType"), 10) === 1 ? "Deduction Amount is required" : false,
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Deduction Amount"
                                            type="text"
                                            error={errors.amount}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                    disabled={parseInt(watch("deductionType"), 10) !== 1}
                                />
                            )}

                            <div>
                                <Controller
                                    name="hours"
                                    control={control}
                                    render={({ field }) => (
                                        <Controller
                                            name="minutes"
                                            control={control}
                                            render={({ field: fieldMinutes }) => (
                                                <TimeSelector
                                                    hours={field.value}
                                                    minutes={fieldMinutes.value}
                                                    onChangeHours={(val) => field.onChange(val)}
                                                    onChangeMinutes={(val) => fieldMinutes.onChange(val)}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </div>

                            <Input
                                label="Total Minutes"
                                type="text"
                                value={watch("totalMinutes") || 0}
                                InputLabelProps={{ shrink: true }}
                                disabled
                            />

                            <Controller
                                name="count"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <Input
                                            {...field}
                                            label="Minimum Occurrences (Exclusive)"
                                            type="text"
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                        <span className='text-xs text-gray-500 ml-2'>
                                            Fine will be pardoned up to {watch("count") || 0} times
                                        </span>
                                    </div>
                                )}
                            />
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type="submit" text={id ? "Update" : "Submit"} isLoading={loading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>

            {/* ✅ Confirm Dialog for Update */}
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={handleConfirmUpdate}
                handleClose={handleCloseDialog}
                loading={loading}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddEarlyExit);
