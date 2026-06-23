import React, { useEffect, useState } from 'react'
import Components from '../../../muiComponents/components';
import DataTable from '../../../common/table/table';
import { setAlert, handleSetTitle } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import { deleteDepartment, getAllDepartment } from '../../../../service/department/departmentService';
import AddDepartmentModel from '../../../models/department/addDepartmentModel';
import CustomIcons from '../../../common/icons/CustomIcons';
import Button from '../../../common/buttons/button';

const Department = ({ setAlert, handleSetTitle }) => {

    const [department, setDepartment] = useState([]);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);
    const [departmentId, setDepartmentId] = useState(null);
    const [openAddDepartmentModel, setOpenAddDepartmentModel] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))

    const handleCloseDialog = () => {
        setLoading(false)
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
        setDepartmentId(null)
    }

    const handleOpenAddDepartmentModel = (id = null) => {
        setOpenAddDepartmentModel(true)
        if (id !== null) {
            setDepartmentId(id)
        }
    }

    const handleCloseAddDepartmentModel = () => {
        setOpenAddDepartmentModel(false)
        setDepartmentId(null)
    }

    const handleOpenDeleteDepartmentDialog = (id) => {
        setDepartmentId(id)
        setDialog({
            open: true,
            title: 'Delete Department',
            message: 'Are you sure! Do you want to delete this department?',
            actionButtonText: 'Delete'
        })
    }

    const handleGetAllDepartment = async () => {
        if (userInfo?.companyId) {
            const response = await getAllDepartment(userInfo?.companyId)
            if (response.data.status === 200) {
                const departments = response.data.result.map((item, index) => ({
                    ...item,
                    rowId: index +1,
                }))
                setDepartment(departments)
            }
        }
    }

    const handleDeleteDepartment = async () => {
        setLoading(true)
        const response = await deleteDepartment(departmentId)
        if (response.data.status === 200) {
            // setAlert({ open: true, message: response.data.message, type: 'success' })
            handleGetAllDepartment()
            setLoading(false)
            handleCloseDialog()
        } else {
            setAlert({ open: true, message: response.data.message, type: 'error' })
            setLoading(false)
        }
    }

    const columns = [
        {
            field: 'rowId',
            headerName: 'id',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 80
        },
        {
            field: 'departmentName',
            headerName: 'Department Name',
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
                            moduleName="Manage Departments"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenAddDepartmentModel(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Manage Departments"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteDepartmentDialog(params.row.id)}>
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
    }

    useEffect(() => {
        handleSetTitle('Manage Departments')
        document.title = "Manage Departments - Calculate Salary";
        handleGetAllDepartment()
    }, [])

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Permission"
                moduleName="Manage Departments"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add department'} onClick={() => handleOpenAddDepartmentModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <>
            <div className='px-4 lg:px-0'>
                <div className='border rounded-lg bg-white w-screen lg:w-full'>
                    <DataTable columns={columns} rows={department} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
                </div>
                <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteDepartment} handleClose={handleCloseDialog} loading={loading} />
                <AddDepartmentModel open={openAddDepartmentModel} handleClose={handleCloseAddDepartmentModel} departmentId={departmentId} handleGetAllDepartment={handleGetAllDepartment} companyId={userInfo?.companyId} />
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(Department)