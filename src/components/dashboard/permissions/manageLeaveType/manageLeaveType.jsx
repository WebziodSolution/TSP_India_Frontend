import React, { useEffect, useState } from 'react';
import Components from '../../../muiComponents/components';
import DataTable from '../../../common/table/table';
import { setAlert, handleSetTitle } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import { deleteLeaveType, getAllLeaveTypesByCompanyId } from '../../../../service/manageLeaveType/manageLeaveTypeService';
import AddLeaveTypeModel from '../../../models/leaveType/addLeaveTypeModel';
import CustomIcons from '../../../common/icons/CustomIcons';
import Button from '../../../common/buttons/button';

const ManageLeaveType = ({ setAlert, handleSetTitle }) => {

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);
    const [leaveTypeId, setLeaveTypeId] = useState(null);
    const [openAddLeaveTypeModel, setOpenAddLeaveTypeModel] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const handleCloseDialog = () => {
        setLoading(false);
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setLeaveTypeId(null);
    };

    const handleOpenAddLeaveTypeModel = (id = null) => {
        setOpenAddLeaveTypeModel(true);
        if (id !== null) {
            setLeaveTypeId(id);
        }
    };

    const handleCloseAddLeaveTypeModel = () => {
        setOpenAddLeaveTypeModel(false);
        setLeaveTypeId(null);
    };

    const handleOpenDeleteLeaveTypeDialog = (id) => {
        setLeaveTypeId(id);
        setDialog({
            open: true,
            title: 'Delete Leave Type',
            message: 'Are you sure! Do you want to delete this leave type?',
            actionButtonText: 'Delete'
        });
    };

    const handleGetAllLeaveTypes = async () => {
        if (userInfo?.companyId) {
            const response = await getAllLeaveTypesByCompanyId(userInfo?.companyId);
            if (response?.data?.status === 200) {
                const types = response.data.result.map((item, index) => ({
                    ...item,
                    rowId: index + 1,
                }));
                setLeaveTypes(types);
            }
        }
    };

    const handleDeleteLeaveType = async () => {
        setLoading(true);
        const response = await deleteLeaveType(leaveTypeId);
        if (response?.data?.status === 200) {
            handleGetAllLeaveTypes();
            setLoading(false);
            handleCloseDialog();
        } else {
            setAlert({ open: true, message: response?.data?.message || "Failed to delete leave type", type: 'error' });
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
            field: 'name',
            headerName: 'Leave Type',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
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
                            moduleName="Manage Leave Type"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenAddLeaveTypeModel(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Manage Leave Type"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteLeaveTypeDialog(params.row.id)}>
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
        handleSetTitle('Manage Leave Type');
        document.title = "Manage Leave Type - Calculate Salary";
        handleGetAllLeaveTypes();
    }, []);

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Permission"
                moduleName="Manage Leave Type"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Leave Type'} onClick={() => handleOpenAddLeaveTypeModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        );
    };

    return (
        <>
            <div className='px-4 lg:px-0'>
                <div className='border rounded-lg bg-white w-screen lg:w-full'>
                    <DataTable columns={columns} rows={leaveTypes} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
                </div>
                <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteLeaveType} handleClose={handleCloseDialog} loading={loading} />
                <AddLeaveTypeModel open={openAddLeaveTypeModel} handleClose={handleCloseAddLeaveTypeModel} leaveTypeId={leaveTypeId} handleGetAllLeaveTypes={handleGetAllLeaveTypes} companyId={userInfo?.companyId} />
            </div>
        </>
    );
};

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(ManageLeaveType);