import React, { useEffect, useState } from 'react'
import Components from '../../../muiComponents/components';
import DataTable from '../../../common/table/table';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import { deleteModules, getAllModules } from '../../../../service/modules/modulesService';
import AddModuleModel from '../../../models/module/addModuleModel';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import CustomIcons from '../../../common/icons/CustomIcons';
import Button from '../../../common/buttons/button';

const Modules = ({ setAlert }) => {

  const [modules, setModules] = useState([]);
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
  const [loading, setLoading] = useState(false);
  const [moduleId, setModuleId] = useState(null);
  const [openAddModuleModel, setOpenAddModuleModel] = useState(false);

  const handleCloseDialog = () => {
    setLoading(false)
    setDialog({
      open: false,
      title: '',
      message: '',
      actionButtonText: ''
    })
    setModuleId(null)
  }

  const handleopenAddModuleModel = (id = null) => {
    setOpenAddModuleModel(true)
    if (id !== null) {
      setModuleId(id)
    }
  }

  const handleCloseAddModuleModel = () => {
    setModuleId(null)
    setOpenAddModuleModel(false)
  }

  const handleOpenDeleteModuleDialog = (id) => {
    setModuleId(id)
    setDialog({
      open: true,
      title: 'Delete Module',
      message: 'Are you sure! Do you want to delete this module?',
      actionButtonText: 'Delete'
    })
  }

  const handleGetAllModules = async () => {
    const response = await getAllModules()
    if (response.data.status === 200) {
      const data = response.data.result?.modulesList.map((item, index) => {
        return {
          ...item,
          rowId: index + 1,
        }
      })
      setModules(data)
    }
  }

  const handleDeleteModule = async () => {
    setLoading(true)
    const response = await deleteModules(moduleId)
    if (response.data.status === 200) {
      // setAlert({ open: true, message: response.data.message, type: 'success' })
      handleGetAllModules()
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
      field: 'moduleName',
      headerName: 'Module Name',
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
              moduleName="Module"
              actionId={2}
              component={
                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                  <Components.IconButton onClick={() => handleopenAddModuleModel(params.row.moduleId)}>
                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                  </Components.IconButton>
                </div>
              }
            />
            <PermissionWrapper
              functionalityName="Permission"
              moduleName="Module"
              actionId={3}
              component={
                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                  <Components.IconButton onClick={() => handleOpenDeleteModuleDialog(params.row.moduleId)}>
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
    handleGetAllModules()
  }, [])

  const actionButtons = () => {
    return (
        <PermissionWrapper
            functionalityName="Permission"
            moduleName="Module"
            actionId={1}
            component={
                <div>
                    <Button type={`button`} text={'Add Module'} onClick={() => handleopenAddModuleModel()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                </div>
            }
        />
    )
}

  return (
    <>
      <div className='px-4 lg:px-0'>
        <div className='border rounded-lg bg-white w-screen lg:w-full'>
          <DataTable columns={columns} rows={modules} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
        </div>
        <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteModule} handleClose={handleCloseDialog} loading={loading} />
        <AddModuleModel open={openAddModuleModel} handleClose={handleCloseAddModuleModel} moduleId={moduleId} handleGetAllModules={handleGetAllModules} />
      </div>
    </>
  )
}

const mapDispatchToProps = {
  setAlert,
};

export default connect(null, mapDispatchToProps)(Modules)