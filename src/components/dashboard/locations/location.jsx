import React, { useEffect, useState } from 'react'
import DataTable from '../../common/table/table'
import { connect } from 'react-redux';
import Components from '../../muiComponents/components';
import { deleteLocation, getAllLocations } from '../../../service/location/locationService';
import { handleSetTitle, setAlert } from '../../../redux/commonReducers/commonReducers';
import AddLocationModel from '../../models/location/addLocationModel';
import AlertDialog from '../../common/alertDialog/alertDialog';
import CustomIcons from '../../common/icons/CustomIcons';

const Location = ({ setAlert, handleSetTitle }) => {
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [openLocationModel, setOpenLocationModel] = useState(false);
    const [rows, setRows] = useState([]);
    const [locationId, setLocationId] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleGetLocations = async () => {
        const response = await getAllLocations();
        setRows(response?.data?.result);
    }

    const getRowId = (row) => {
        return row.id;
    }

    const handleAddLocation = () => {
        setOpenLocationModel(true)
    }

    const handleUpdateLocation = (id) => {
        setLocationId(id);
        setOpenLocationModel(true)
    }

    const handleCloseLocationDialog = () => {
        setLocationId(null);
        setOpenLocationModel(false)
    }

    const handleDeleteLocationDialog = (id) => {
        setLocationId(id);
        setDialog({
            open: true,
            title: 'Delete Location',
            message: 'Are you sure! Do you want to delete this location?',
            actionButtonText: 'Delete',
        })
    }

    const handleDeleteLocation = async (id) => {
        setLoading(true);
        if (locationId) {
            const response = await deleteLocation(locationId);
            if (response?.data?.status === 200) {
                setLoading(false);
                setAlert({
                    open: true,
                    message: response?.data?.message,
                    type: 'success',
                });
                handleGetLocations();
            } else {
                setLoading(false);
                setAlert({
                    open: true,
                    message: response?.data?.message,
                    type: 'error',
                });
            }
        }
    }

    const handleCloseDialog = () => {
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setLocationId(null);
    }

    const columns = [
        {
            field: 'id',
            headerName: 'id',
            headerClassName: 'uppercase',
            minWidth: 20
        },
        {
            field: 'timeZone',
            headerName: 'TimeZone',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'city',
            headerName: 'City',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'state',
            headerName: 'State',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 140
        },
        {
            field: 'country',
            headerName: 'Country',
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
                    <div className='flex items-center gap-0 justify-center h-full'>
                        <Components.IconButton onClick={() => handleUpdateLocation(params.row.id)}>
                            <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-blue-600 h-4 w-4' />
                        </Components.IconButton>
                        <Components.IconButton onClick={() => handleDeleteLocationDialog(params.row.id)}>
                            <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-red-600 h-4 w-4' />
                        </Components.IconButton>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        handleGetLocations();
    }, [])

    return (
        <div className='px-4 lg:px-0'>
            <div className='shadow-lg rounded-lg bg-white w-screen lg:w-full'>
                <DataTable columns={columns} rows={rows} getRowId={getRowId} height={450} showButtons={true} buttonText='Add Loaction' buttonAction={() => handleAddLocation()} />
            </div>
            <AddLocationModel open={openLocationModel} handleClose={handleCloseLocationDialog} locationId={locationId} handleGetLocations={handleGetLocations} />
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteLocation} handleClose={handleCloseDialog} loading={loading} />

        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(Location)