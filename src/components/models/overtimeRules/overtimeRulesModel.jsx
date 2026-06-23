import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import Select from '../../common/select/select';
import {
    createOvertimeRule,
    getOvertimeRule,
    updateOvertimeRule
} from '../../../service/overtimeRules/overtimeRulesService';
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

const overTimeTypes = [
    { id: 1, title: "Fixed Amount" },
    { id: 2, title: "Fixed Amount Per Hour" },
    { id: 3, title: "1 Day Salary" },
    { id: 4, title: "1.5 Day Salary" },
    { id: 5, title: "2 Day Salary" },
    { id: 6, title: "2.5 Day Salary" },
    { id: 7, title: "3 Day Salary" }
];

function OvertimeRulesModel({
    setAlert,
    open,
    handleClose,
    companyId,
    overTimeId,
    handleGetAllOvertimeRules
}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // ✅ store submit data until user confirms "Yes"
    const [pendingData, setPendingData] = useState(null);

    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        actionButtonText: ''
    });

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
            ruleName: "",
            otMinutes: "",
            otAmount: "",
            otType: 1,
            hours: 0,
            minutes: 0,
            userIds: [],
        },
    });

    const handleOpenDialog = () => {
        setDialog({
            open: true,
            title: 'Update Rule Warning',
            message:
                'Updating this rule will affect salary calculations. Are you sure you want to proceed?',
            actionButtonText: 'Yes',
        });
    };

    const handleCloseDialog = () => {
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: '',
        });
        setPendingData(null);
        setLoading(false);
    };

    const onClose = () => {
        setLoading(false);
        setPendingData(null);
        reset({
            id: "",
            ruleName: "",
            otMinutes: "",
            otAmount: "",
            otType: 1,
            hours: 0,
            minutes: 0,
            userIds: [],
        });
        handleClose();
    };

    // ✅ form submit
    const submit = async (data) => {
        const newData = {
            ...data,
            companyId: companyId,
            createdBy: userInfo?.employeeId || null,
            otType: overTimeTypes.find(type => type.id === data.otType)?.title || "",
            userIds: data.userIds?.length > 0 ? JSON.stringify(data.userIds) : null,
        };

        // CREATE -> direct submit
        if (!overTimeId) {
            setLoading(true);
            const response = await createOvertimeRule(companyId, newData);

            if (response?.data?.status === 201) {
                handleGetAllOvertimeRules();
                onClose();
            } else {
                setLoading(false);
                setAlert({
                    open: true,
                    message: response?.data?.message || "Failed to create overtime rule",
                    type: "error",
                });
            }
            return;
        }

        // UPDATE -> open dialog first, save data for confirm
        setPendingData(newData);
        handleOpenDialog();
    };

    // ✅ called when user clicks YES in AlertDialog
    const handleConfirmUpdate = async () => {
        if (!overTimeId || !pendingData) return;

        setLoading(true);
        const response = await updateOvertimeRule(overTimeId, pendingData);

        if (response?.data?.status === 200) {
            handleCloseDialog();
            handleGetAllOvertimeRules();
            onClose();
        } else {
            setLoading(false);
            setAlert({
                open: true,
                message: response?.data?.message || "Failed to update overtime rule",
                type: "error",
            });
        }
    };

    const handleGetOvertimeRuleById = async () => {
        if (overTimeId !== null && open) {
            const response = await getOvertimeRule(overTimeId);

            if (response?.data?.status === 200) {
                const data = response?.data?.result;

                // Split otMinutes into hours and minutes
                const totalMinutes = parseInt(data?.otMinutes || 0, 10);
                const hrs = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;

                reset({
                    id: data?.id || "",
                    ruleName: data?.ruleName || "",
                    otMinutes: totalMinutes.toString(),
                    otAmount: data?.otAmount || "",
                    otType: overTimeTypes.find((type) => type.title === data?.otType)?.id || 1,
                    hours: hrs,
                    minutes: mins,
                    userIds: data?.userIds ? JSON.parse(data.userIds) : [],
                });
            }
        }
    };

    // keep otMinutes synced with hours + minutes
    useEffect(() => {
        const hrs = watch("hours") || 0;
        const mins = watch("minutes") || 0;
        const totalMins = hrs * 60 + mins;
        setValue("otMinutes", totalMins.toString());
    }, [watch("hours"), watch("minutes"), setValue, watch]);

    useEffect(() => {
        handleGetOvertimeRuleById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overTimeId, open]);

    const otTypeVal = parseInt(watch("otType"), 10);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle
                    sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }}
                    id="customized-dialog-title"
                >
                    {overTimeId ? "Update" : "Create"} Overtime Rule
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

                            <Input
                                label="Calculation Type"
                                type="text"
                                value="Post Payable Hours/Shift End"
                                InputLabelProps={{ shrink: true }}
                                disabled
                            />

                            <Controller
                                name="otType"
                                control={control}
                                rules={{ required: "OT Type is required" }}
                                render={({ field }) => (
                                    <Select
                                        options={overTimeTypes}
                                        error={!!errors.otType}
                                        label="OT Type"
                                        placeholder="Select type"
                                        value={otTypeVal || null}
                                        onChange={(_, newValue) => field.onChange(newValue?.id || null)}
                                    />
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-3 gap-4 mt-4'>
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
                                label="Total OT Minutes"
                                type="text"
                                value={watch("otMinutes") || 0}
                                InputLabelProps={{ shrink: true }}
                                disabled
                            />

                            {(otTypeVal === 1 || otTypeVal === 2) && (
                                <Controller
                                    name="otAmount"
                                    control={control}
                                    rules={{
                                        required: "OT Amount is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="OT Amount"
                                            type="text"
                                            error={errors.otAmount}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(numericValue);
                                            }}
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button
                                type="submit"
                                text={overTimeId ? "Update" : "Submit"}
                                isLoading={loading}
                            />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>

            {/* ✅ Confirm dialog for Update */}
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

export default connect(null, mapDispatchToProps)(OvertimeRulesModel);
