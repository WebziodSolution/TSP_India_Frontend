import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { createLeaveType, getLeaveTypeById, updateLeaveType } from '../../../service/manageLeaveType/manageLeaveTypeService';
import CustomIcons from '../../common/icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddLeaveTypeModel({ setAlert, open, handleClose, leaveTypeId, handleGetAllLeaveTypes, companyId }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: ""
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            name: ""
        });
        handleClose();
    };

    const submit = async (data) => {
        const newData = {
            ...data,
            companyId: companyId
        };
        if (leaveTypeId) {
            setLoading(true);
            const response = await updateLeaveType(leaveTypeId, newData);
            if (response?.data?.status === 200) {
                handleGetAllLeaveTypes();
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        } else {
            setLoading(true);
            const response = await createLeaveType(newData);
            if (response?.data?.status === 201) {
                handleGetAllLeaveTypes();
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    };

    const handleGetLeaveType = async () => {
        if (!leaveTypeId) return;

        const response = await getLeaveTypeById(leaveTypeId);
        if (response?.data?.status === 200) {
            reset(response.data.result);
        } else {
            setAlert({ open: true, message: response?.data?.message || "Failed to fetch leave type details", type: 'error' });
        }
    };

    useEffect(() => {
        handleGetLeaveType();
    }, [leaveTypeId]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {leaveTypeId ? "Update" : "Add"} Leave Type
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
                        <Controller
                            name="name"
                            control={control}
                            rules={{
                                required: "Leave type name is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Leave Type Name"
                                    type={`text`}
                                    error={errors.name}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={leaveTypeId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddLeaveTypeModel);
