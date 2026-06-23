import React, { useEffect, useState } from 'react'
import AlertDialog from '../../common/alertDialog/alertDialog';
import { deleteShift, getAllShifts, } from '../../../service/companyShift/companyShiftService';
import PermissionWrapper from '../../common/permissionWrapper/PermissionWrapper';
import Components from '../../muiComponents/components';
import CustomIcons from '../../common/icons/CustomIcons';
import DataTable from '../../common/table/table';
import Button from '../../common/buttons/button';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import { setAlert, handleSetTitle } from '../../../redux/commonReducers/commonReducers';
import AddShiftModel from '../../models/shift/addShiftModel';

const ManageShift = ({ setAlert, handleSetTitle }) => {
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [shifts, setShifts] = useState([])
    const [shiftId, setShiftId] = useState(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))

    const hanndleCloseShiftModel = () => {
        setOpen(false)
        setShiftId(null)
    }

    const handleAddShift = (id = null) => {
        setShiftId(id)
        setOpen(true)
    }

    const handleCloseDialog = () => {
        setDialog({ ...dialog, open: false })
    }

    const handleOpenDeleteShiftModel = (id) => {
        setShiftId(id)
        setDialog({
            open: true,
            title: "Delete Shift",
            message: "Are you sure ! Do you want to delete this shift?",
            actionButtonText: "Delete",
        });
    }

    const handleDeleteShift = async () => {
        if (!shiftId) return
        setLoading(true)
        const response = await deleteShift(shiftId)
        if (response.data.status === 200) {
            setDialog({ ...dialog, open: false })
            handleGetAllShifts()
            setLoading(false)
            setShiftId(null)
        } else {
            setLoading(false)
            setAlert({
                open: true,
                message: response.data.message,
                type: "error",
            })
        }
    }

    const handleGetAllShifts = async () => {
        if (!userInfo?.companyId) return
        const response = await getAllShifts(userInfo?.companyId)
        if (response.data.status === 200) {
            setShifts(response.data.result)
        }
    }

    useEffect(() => {
        handleGetAllShifts()
        handleSetTitle("Manage Shifts")
        document.title = "Manage Shifts - Calculate Salary";
    }, [])

    const columns = [
        {
            field: 'shiftName',
            headerName: 'shift Name',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            sortable: false,
        },
        {
            field: 'shiftType',
            headerName: 'shift Type',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'startTime',
            headerName: 'duration',
            sortable: false,
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 190,
            renderCell: (params) => {
                return (
                    <div>
                        {params.row.startTime ? dayjs(params.row?.startTime).format("hh:mm A") : ""} - {params.row.endTime ? dayjs(params.row?.endTime).format("hh:mm A") : ""}
                    </div>
                );
            },
        },
        {
            field: 'totalHours',
            headerName: 'totalHours',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 120,
            sortable: false,
            renderCell: (params) => {
                return (
                    <div>
                        {parseFloat(params.row.totalHours)}
                    </div>
                );
            },
        },       
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            sortable: false,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Company"
                            moduleName="Manage Shifts"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleAddShift(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Company"
                            moduleName="Manage Shifts"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteShiftModel(params.row.id)}>
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
        return row.id;
    }

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Company"
                moduleName="Manage Shifts"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add Shift'} onClick={() => handleAddShift()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }


    return (
        <div className='px-4 lg:px-0'>
            <div className='border rounded-lg bg-white w-full lg:w-full '>
                <DataTable columns={columns} rows={shifts} getRowId={getRowId} showButtons={true} buttons={actionButtons} />
            </div>
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteShift} handleClose={handleCloseDialog} loading={loading} />
            <AddShiftModel open={open} handleClose={hanndleCloseShiftModel} handleGetAllShifts={handleGetAllShifts} shiftId={shiftId} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(ManageShift)
