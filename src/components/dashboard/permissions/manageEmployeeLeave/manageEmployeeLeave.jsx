import React, { useEffect, useState } from 'react';
import Components from '../../../muiComponents/components';
import DataTable from '../../../common/table/table';
import { setAlert, handleSetTitle } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import { deleteEmployeeLeaveMaster, getAllEmployeeLeaveMastersByCompanyId } from '../../../../service/manageEmployeeLeave/manageEmployeeLeaveService';
import { getAllEmployeeListByCompanyId } from '../../../../service/companyEmployee/companyEmployeeService';
import { getAllLeaveTypesByCompanyId } from '../../../../service/manageLeaveType/manageLeaveTypeService';
import AddEmployeeLeaveModel from '../../../models/employeeLeave/addEmployeeLeaveModel';
import CustomIcons from '../../../common/icons/CustomIcons';
import Button from '../../../common/buttons/button';

const ManageEmployeeLeave = ({ setAlert, handleSetTitle }) => {

    const [employeeLeaves, setEmployeeLeaves] = useState([]);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);
    const [employeeLeaveId, setEmployeeLeaveId] = useState(null);
    const [openAddEmployeeLeaveModel, setOpenAddEmployeeLeaveModel] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const handleCloseDialog = () => {
        setLoading(false);
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setEmployeeLeaveId(null);
    };

    const handleOpenAddEmployeeLeaveModel = (id = null) => {
        setOpenAddEmployeeLeaveModel(true);
        if (id !== null) {
            setEmployeeLeaveId(id);
        }
    };

    const handleCloseAddEmployeeLeaveModel = () => {
        setOpenAddEmployeeLeaveModel(false);
        setEmployeeLeaveId(null);
    };

    const handleOpenDeleteEmployeeLeaveDialog = (id) => {
        setEmployeeLeaveId(id);
        setDialog({
            open: true,
            title: 'Delete Employee Leave',
            message: 'Are you sure! Do you want to delete this employee leave record?',
            actionButtonText: 'Delete'
        });
    };

    const handleGetAllEmployeeLeaves = async () => {
        if (userInfo?.companyId) {
            // Load Employees
            const empRes = await getAllEmployeeListByCompanyId(userInfo.companyId);
            const employees = empRes?.data?.status === 200 ? empRes.data.result : [];

            // Load Leave Types
            const ltRes = await getAllLeaveTypesByCompanyId(userInfo.companyId);
            const leaveTypes = ltRes?.data?.status === 200 ? ltRes.data.result : [];

            // Load Leaves
            const response = await getAllEmployeeLeaveMastersByCompanyId(userInfo.companyId);
            if (response?.data?.status === 200) {
                const mappedLeaves = response.data.result.map((item, index) => {
                    const emp = employees.find(e => e.employeeId === item.employeeId);
                    const lt = leaveTypes.find(l => l.id === item.leaveTypeId);
                    return {
                        ...item,
                        rowId: index + 1,
                        employeeName: emp ? emp.userName : `ID: ${item.employeeId}`,
                        leaveTypeName: lt ? lt.name : `ID: ${item.leaveTypeId}`
                    };
                });
                setEmployeeLeaves(mappedLeaves);
            }
        }
    };

    const handleDeleteEmployeeLeave = async () => {
        setLoading(true);
        const response = await deleteEmployeeLeaveMaster(employeeLeaveId);
        if (response?.data?.status === 200) {
            handleGetAllEmployeeLeaves();
            setLoading(false);
            handleCloseDialog();
        } else {
            setAlert({ open: true, message: response?.data?.message || "Failed to delete employee leave", type: 'error' });
            setLoading(false);
        }
    };

    const columns = [
        {
            field: 'rowId',
            headerName: 'id',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 80
        },
        {
            field: 'employeeName',
            headerName: 'Employee',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'leaveTypeName',
            headerName: 'Leave Type',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'totalLeave',
            headerName: 'Total Leave',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'usedLeave',
            headerName: 'Used Leave',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Manage Employee Leave"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenAddEmployeeLeaveModel(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Manage Employee Leave"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteEmployeeLeaveDialog(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    };

    useEffect(() => {
        handleSetTitle('Manage Employee Leave');
        document.title = "Manage Employee Leave - Calculate Salary";
        handleGetAllEmployeeLeaves();
    }, []);

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Permission"
                moduleName="Manage Employee Leave"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Employee Leave'} onClick={() => handleOpenAddEmployeeLeaveModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        );
    };

    return (
        <>
            <div className='px-4 lg:px-0'>
                <div className='border rounded-lg bg-white w-screen lg:w-full'>
                    <DataTable columns={columns} rows={employeeLeaves} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
                </div>
                <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteEmployeeLeave} handleClose={handleCloseDialog} loading={loading} />
                <AddEmployeeLeaveModel open={openAddEmployeeLeaveModel} handleClose={handleCloseAddEmployeeLeaveModel} employeeLeaveId={employeeLeaveId} handleGetAllEmployeeLeaves={handleGetAllEmployeeLeaves} companyId={userInfo?.companyId} />
            </div>
        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(ManageEmployeeLeave);
