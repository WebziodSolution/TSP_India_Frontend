import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import { getAllCompanyEmployee } from '../../../service/companyEmployee/companyEmployeeService';
import { assignEmployees } from '../../../service/weeklyOff/WeeklyOffService';
import CheckBoxSelect from '../../common/select/checkBoxSelect';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AssignWeeklyOff({ setAlert, open, handleClose, id, assignedEmployeeIds, handleGetAllWeekOffTemplate }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const {
        handleSubmit,
        control,
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
            employeeIds: [],
            removeEmployeeIds: []
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            employeeIds: []
        });
        handleClose();
    };

    const submit = async (data) => {
        const newData = {
            removeEmployeeIds: watch("removeEmployeeIds") || [],
            employeeIds: data.employeeIds,
            weekOffId: id
        }
        if (id) {
            setLoading(true)
            const response = await assignEmployees(newData);
            if (response?.data?.status === 200) {
                setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetAllWeekOffTemplate()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }

        }
    }

    const handleGetEmployees = async () => {
        setLoading(true);
        if (open) {
            const response = await getAllCompanyEmployee(userInfo?.companyId);
            if (response?.data?.status === 200) {
                const employeeList = response.data?.result?.map((employee) => ({
                    id: employee.employeeId,
                    title: employee.userName,
                }));
                setEmployees(employeeList);
                setValue('employeeIds', assignedEmployeeIds);
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        handleGetEmployees();
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
                    Assign Weekly-Off To Employees
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
                            name="employeeIds"
                            control={control}
                            render={({ field }) => {
                                const selectedOptions = employees.filter((emp) =>
                                    (field.value || []).includes(emp.id)
                                );

                                return (
                                    <CheckBoxSelect
                                        options={employees}
                                        label="Select Employees"
                                        placeholder="Select employees"
                                        value={selectedOptions}
                                        onChange={(event, newValue) => {
                                            const newIds = newValue.map((opt) => opt.id);
                                            const prevIds = field.value || [];

                                            // detect removed ones
                                            const removed = prevIds.filter((id) => !newIds.includes(id));
                                            // detect added ones
                                            const added = newIds.filter((id) => !prevIds.includes(id));

                                            // update main field
                                            field.onChange(newIds);

                                            // handle removeEmployeeIds toggle
                                            const prev = watch("removeEmployeeIds") || [];
                                            let updated = [...prev];

                                            // add newly unchecked
                                            removed.forEach((id) => {
                                                if (!updated.includes(id)) {
                                                    updated.push(id);
                                                }
                                            });

                                            // if re-checked, remove from removeEmployeeIds
                                            added.forEach((id) => {
                                                updated = updated.filter((r) => r !== id);
                                            });

                                            setValue("removeEmployeeIds", updated);

                                        }}
                                        checkAll={true}
                                    />
                                );
                            }}
                        />
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={"Assign"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AssignWeeklyOff)
