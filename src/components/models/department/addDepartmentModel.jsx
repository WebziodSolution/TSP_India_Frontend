import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { createDepartment, getDepartment, updateDepartment } from '../../../service/department/departmentService';
import CustomIcons from '../../common/icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddDepartmentModel({ setAlert, open, handleClose, departmentId, handleGetAllDepartment, companyId }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            departmentName: ""
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            departmentName: ""
        });
        handleClose();
    };

    const submit = async (data) => {
        const newData = {
            ...data,
            companyId: companyId
        }
        if (departmentId) {
            setLoading(true)
            const response = await updateDepartment(departmentId, newData);
            if (response?.data?.status === 200) {
                // setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetAllDepartment()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }

        } else {
            setLoading(true)
            const response = await createDepartment(newData);
            if (response?.data?.status === 201) {
                // setAlert({ open: true, message: response.data.message, type: 'success' });
                handleGetAllDepartment()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    const handleGetDepartment = async () => {
        if (!departmentId) return;

        const response = await getDepartment(departmentId);
        if (response.data.status === 200) {
            reset(response.data.result);
        } else {
            setAlert({ message: response.data.message, type: 'error' });
        }
    };


    useEffect(() => {
        handleGetDepartment();
    }, [departmentId])

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
                    {departmentId ? "Update" : "Add"} Department
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
                            name="departmentName"
                            control={control}
                            rules={{
                                required: "Department name is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Department Name"
                                    type={`text`}
                                    error={errors.departmentName}
                                    // helperText={errors.departmentName && errors.departmentName.message}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={departmentId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddDepartmentModel)
