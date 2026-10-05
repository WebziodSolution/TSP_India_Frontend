import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import { getAllCompanyEmployee } from '../../../service/companyEmployee/companyEmployeeService';
import Select from '../../common/select/select';
import CheckBoxSelect from '../../common/select/checkBoxSelect';
import { assignHolidaysTemplate } from '../../../service/holidaysTemplates/holidaysTemplatesService';
import { getAllDepartment } from '../../../service/department/departmentService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AssignHolidayTemplate({ setAlert, open, handleClose, id, assignedEmployeeIds, handleGetHolidaysTemplates }) {
    const theme = useTheme()
    const [department, setDepartment] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

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
        setSelectedDepartment(null);
        reset({
            employeeIds: [],
            removeEmployeeIds: []
        });
        handleClose();
    };

    const handleGetAllDepartment = async () => {
        if (userInfo?.companyId) {
            const response = await getAllDepartment(userInfo?.companyId)
            if (response.data.status === 200) {
                const departments = response.data.result.map((item, index) => ({
                    ...item,
                    id: item.id,
                    title: item.departmentName,
                    rowId: index + 1,
                }))
                setDepartment(departments)
            }
        }
    }

    const handleDepartmentChange = (event, newValue) => {
        const deptId = newValue?.id || null;
        setSelectedDepartment(deptId);

        if (deptId) {
            const matchingEmployees = employees.filter(
                (emp) => emp.departmentId && String(emp.departmentId) === String(deptId)
            );
            const matchingIds = matchingEmployees.map((emp) => emp.id);

            const currentEmployeeIds = watch("employeeIds") || [];
            const newEmployeeIds = Array.from(new Set([...currentEmployeeIds, ...matchingIds]));
            setValue("employeeIds", newEmployeeIds);

            // If any matching employees were in removeEmployeeIds, remove them
            const prevRemoved = watch("removeEmployeeIds") || [];
            const updatedRemoved = prevRemoved.filter((id) => !matchingIds.includes(id));
            setValue("removeEmployeeIds", updatedRemoved);
        }
    };
    // console.log(watch("removeEmployeeIds"))
    const submit = async (data) => {
        const newData = {
            removeEmployeeIds: watch("removeEmployeeIds") || [],
            employeeIds: data.employeeIds,
            id: id
        }
        if (id) {
            setLoading(true)
            const response = await assignHolidaysTemplate(newData);
            if (response?.data?.status === 200) {
                setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetHolidaysTemplates();
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
                    departmentId: employee.departmentId || employee.department?.id || null,
                }));
                setEmployees(employeeList);
                setValue('employeeIds', assignedEmployeeIds || []);
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (open) {
            setSelectedDepartment(null);
            handleGetAllDepartment();
            handleGetEmployees();
        }
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
                    Assign Holiday Template To Employees
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
                        <div className='flex flex-col gap-4'>
                            <div>
                                <Select
                                    options={department}
                                    label="Select Department"
                                    placeholder="Select department"
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                />
                            </div>
                            <div>
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
                            </div>
                        </div>
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

export default connect(null, mapDispatchToProps)(AssignHolidayTemplate)
