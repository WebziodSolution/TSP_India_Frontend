import React, { useEffect, useState } from 'react'
import { deleteContractor, getAllContractor } from '../../../../service/contractor/contractorService';
import { connect } from 'react-redux';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import AddContractorModel from '../../../models/contractor/addContractorModel';
import DataTable from '../../../common/table/table';
import Components from '../../../muiComponents/components';
import CustomIcons from '../../../common/icons/CustomIcons';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';

const Contractor = ({ setAlert }) => {
    const [contractorId, setContractorId] = useState(null);
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [contractors, setContractors] = useState([]);
    const [addContractorModel, setAddContractorModel] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCloseContractorModel = () => {
        setContractorId(null)
        setAddContractorModel(false)
        handleGetAllContractors()
    }

    const handleUpdateContractor = (id) => {
        setContractorId(id)
        setAddContractorModel(true)
    }

    const handleDeleteContractorModel = (id) => {
        setContractorId(id)
        setDialog({
            open: true,
            title: "Delete Contractor",
            message: "Are you sure! Do you want to delete this contractor?",
            actionButtonText: "Delete",
        })
    }

    const handleDeleteContractor = async () => {
        setLoading(true)
        const response = await deleteContractor(contractorId)

        if (response?.data?.status === 200) {
            // setAlert({ open: true, message: response.data.message, type: "success" })
            handleCloseContractorDialog()
            setContractorId(null)
            setLoading(false)
            handleGetAllContractors()
        } else {
            setAlert({ open: true, message: response.data.message, type: "error" })
            setLoading(false)
        }
    }

    const handleCloseContractorDialog = () => {
        setContractorId(null)
        setDialog({
            open: false,
            title: "",
            message: "",
            actionButtonText: "",
        })
    }

    const handleGetAllContractors = async () => {
        const response = await getAllContractor()
        setContractors(response?.data?.result)
    }

    const contractorColumns = [
        {
            field: 'id',
            headerName: 'id',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 80
        },
        {
            field: 'contractorName',
            headerName: 'Contractor Name',
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
                        {/* <Components.IconButton onClick={() => handleUpdateContractor(params.row.id)}>
                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-blue-600 h-4 w-4' />
                        </Components.IconButton> */}
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Contractor"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleUpdateContractor(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Permission"
                            moduleName="Contractor"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleDeleteContractorModel(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-red-600 h-5 w-5' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        handleGetAllContractors()
    }, [])

    const getRowId = (row) => {
        return row.id;
    }
    return (
        <div className='px-4 lg:px-0'>
            <div className='border rounded-lg bg-white w-screen lg:w-full'>
                <DataTable columns={contractorColumns} rows={contractors} getRowId={getRowId} height={350} showButtons={true} buttonText='Add Contractor' buttonAction={() => setAddContractorModel(true)} permissions={{ functionalityName: "Permission", moduleName: "Contractor", actionId: 1 }} />
            </div>
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteContractor} handleClose={handleCloseContractorDialog} loading={loading} />
            <AddContractorModel open={addContractorModel} handleClose={handleCloseContractorModel} contractorId={contractorId} />

        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Contractor) 
