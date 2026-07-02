import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import Select from '../../common/select/select';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { createEmployeeLeaveMaster, getEmployeeLeaveMasterById, updateEmployeeLeaveMaster } from '../../../service/manageEmployeeLeave/manageEmployeeLeaveService';
import { getAllEmployeeListByCompanyId } from '../../../service/companyEmployee/companyEmployeeService';
import { getAllLeaveTypesByCompanyId } from '../../../service/manageLeaveType/manageLeaveTypeService';
import CustomIcons from '../../common/icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddEmployeeLeaveModel({ setAlert, open, handleClose, employeeLeaveId, handleGetAllEmployeeLeaves, companyId }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            employeeId: "",
            leaveTypeId: "",
            totalLeave: 0,
            usedLeave: 0
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            employeeId: "",
            leaveTypeId: "",
            totalLeave: 0,
            usedLeave: 0
        });
        handleClose();
    };

    const submit = async (data) => {
        setLoading(true);
        const payload = {
            employeeId: data.employeeId,
            leaveTypeId: data.leaveTypeId,
            totalLeave: data.totalLeave || 0,
            usedLeave: data.usedLeave || 0
        };

        if (employeeLeaveId) {
            const response = await updateEmployeeLeaveMaster(employeeLeaveId, payload);
            if (response?.data?.status === 200) {
                handleGetAllEmployeeLeaves();
                onClose();
            } else {
                setAlert({ open: true, message: response?.data?.message || "Failed to update employee leave", type: 'error' });
                setLoading(false);
            }
        } else {
            const response = await createEmployeeLeaveMaster(payload);
            if (response?.data?.status === 201) {
                handleGetAllEmployeeLeaves();
                onClose();
            } else {
                setAlert({ open: true, message: response?.data?.message || "Failed to create employee leave", type: 'error' });
                setLoading(false);
            }
        }
    };

    const handleGetEmployeeLeave = async () => {
        if (!employeeLeaveId) return;

        const response = await getEmployeeLeaveMasterById(employeeLeaveId);
        if (response?.data?.status === 200) {
            reset(response.data.result);
        } else {
            setAlert({ open: true, message: response?.data?.message || "Failed to fetch employee leave details", type: 'error' });
        }
    };

    const loadDropdownData = async () => {
        if (companyId) {
            // Load Employees
            const empRes = await getAllEmployeeListByCompanyId(companyId);
            if (empRes?.data?.status === 200) {
                setEmployeeOptions(empRes.data.result.map(emp => ({
                    id: emp.employeeId,
                    title: emp.userName
                })));
            }

            // Load Leave Types
            const ltRes = await getAllLeaveTypesByCompanyId(companyId);
            if (ltRes?.data?.status === 200) {
                setLeaveTypeOptions(ltRes.data.result.map(lt => ({
                    id: lt.id,
                    title: lt.name
                })));
            }
        }
    };

    useEffect(() => {
        if (open) {
            loadDropdownData();
        }
    }, [open, companyId]);

    useEffect(() => {
        if (open && employeeLeaveId) {
            handleGetEmployeeLeave();
        }
    }, [employeeLeaveId, open]);

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {employeeLeaveId ? "Update" : "Add"} Employee Leave
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
                    <Components.DialogContent dividers className='grid grid-cols-2 gap-4'>
                        <Controller
                            name="employeeId"
                            control={control}
                            rules={{ required: "Employee is required" }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={employeeOptions}
                                    error={errors.employeeId}
                                    label="Employee"
                                    placeholder="Select employee"
                                    value={parseInt(watch("employeeId")) || null}
                                    onChange={(_, newValue) => {
                                        field.onChange(newValue?.id || null);
                                        setValue("employeeId", newValue?.id || null);
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="leaveTypeId"
                            control={control}
                            rules={{ required: "Leave Type is required" }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={leaveTypeOptions}
                                    error={errors.leaveTypeId}
                                    label="Leave Type"
                                    placeholder="Select leave type"
                                    value={parseInt(watch("leaveTypeId")) || null}
                                    onChange={(_, newValue) => {
                                        field.onChange(newValue?.id || null);
                                        setValue("leaveTypeId", newValue?.id || null);
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="totalLeave"
                            control={control}
                            rules={{
                                required: "Total leave is required",
                                min: { value: 0, message: "Total leave cannot be negative" }
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Total Leave"
                                    type="text"
                                    error={errors.totalLeave}
                                    onChange={(e) => {
                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                        field.onChange(numericValue);
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name="usedLeave"
                            control={control}
                            rules={{
                                required: "Used leave is required",
                                min: { value: 0, message: "Used leave cannot be negative" }
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Used Leave"
                                    type="text"
                                    error={errors.usedLeave}
                                    onChange={(e) => {
                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                        field.onChange(numericValue);
                                    }}
                                />
                            )}
                        />
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={employeeLeaveId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddEmployeeLeaveModel);
