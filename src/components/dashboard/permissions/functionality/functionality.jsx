import React, { useEffect, useState } from 'react'
import Components from '../../../muiComponents/components';
import DataTable from '../../../common/table/table';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import { deleteFunctionality, getAllFunctionality } from '../../../../service/functionality/functionalityService';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import AddFunctionalityModel from '../../../models/functionality/addFunctionalityModel';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import CustomIcons from '../../../common/icons/CustomIcons';
import Button from '../../../common/buttons/button';

const Functionality = ({ setAlert }) => {

    const [functionality, setFunctionality] = useState([]);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);
    const [functionalityId, setFunctionalityId] = useState(null);
    const [openAddFunctionalityModel, setOpenAddFunctionalityModel] = useState(false);

    const handleCloseDialog = () => {
        setLoading(false)
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
        setFunctionalityId(null)
    }

    const handleOpenAddFunctionalityModel = (id = null) => {
        setOpenAddFunctionalityModel(true)
        if (id !== null) {
            setFunctionalityId(id)
        }
    }

    const handleCloseAddFunctionalityModel = () => {
        setOpenAddFunctionalityModel(false)
        setFunctionalityId(null)
    }

    const handleOpenDeleteFunctionalityDialog = (id) => {
        setFunctionalityId(id)
        setDialog({
            open: true,
            title: 'Delete Functionality',
            message: 'Are you sure! Do you want to delete this functionality?',
            actionButtonText: 'Delete'
        })
    }

    const handleGetAllFunctionality = async () => {
        const response = await getAllFunctionality()
        if (response.data.status === 200) {
            const data = response.data.result?.map((item, index) => {
                return {
                    ...item,
                    rowId: index + 1,
                }
            })
            setFunctionality(data)
        }
    }

    const handleDeleteFunctionality = async () => {
        setLoading(true)
        const response = await deleteFunctionality(functionalityId)
        if (response.data.status === 200) {
            setAlert({ open: true, message: response.data.message, type: 'success' })
            handleGetAllFunctionality()
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
            headerName: '#',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 80
        },
        {
            field: 'functionalityName',
            headerName: 'functionality Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
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
                            functionalityName="Permission"
                            moduleName="Functionality"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenAddFunctionalityModel(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Functionality"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteFunctionalityDialog(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />

                        {/* <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Functionality"
                            actionId={2}
                            component={
                                <Components.IconButton onClick={() => handleOpenAddFunctionalityModel(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-blue-600 h-4 w-4' />
                                </Components.IconButton>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Functionality"
                            actionId={3}
                            component={
                                <Components.IconButton onClick={() => handleOpenDeleteFunctionalityDialog(params.row.id)}>
                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-red-600 h-4 w-4' />
                                </Components.IconButton>
                            }
                        /> */}
                    </div>
                );
            },
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    }

    useEffect(() => {
        handleGetAllFunctionality()
    }, [])

    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Permission"
                moduleName="Functionality"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add functionality'} onClick={() => handleOpenAddFunctionalityModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <>
            <div className='px-4 lg:px-0'>
                <div className='border rounded-lg bg-white w-screen lg:w-full'>
                    <DataTable columns={columns} rows={functionality} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons}/>
                </div>
                <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteFunctionality} handleClose={handleCloseDialog} loading={loading} />
                <AddFunctionalityModel open={openAddFunctionalityModel} handleClose={handleCloseAddFunctionalityModel} functionalityId={functionalityId} handleGetAllFunctionality={handleGetAllFunctionality} />
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Functionality)