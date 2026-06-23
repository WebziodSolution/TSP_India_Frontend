import React, { useState } from 'react'
import Components from '../../../muiComponents/components';
import { deleteRole, getAllRoleList } from '../../../../service/roles/roleService';
import DataTable from '../../../common/table/table';
import { useNavigate } from 'react-router-dom';
import { handleSetTitle, setAlert } from '../../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import CustomIcons from '../../../common/icons/CustomIcons';
import { deleteEmployeeRole, getAllCompanyRole } from '../../../../service/companyEmployeeRole/companyEmployeeRoleService';
import Button from '../../../common/buttons/button';

const Roles = ({ handleSetTitle }) => {
  const navigate = useNavigate()
  const [userRoles, setUserRoles] = useState([])
  const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
  const [roleid, setRoleId] = useState(null)
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  const handleGetAllUserRoles = async () => {
    handleSetTitle('Manage Roles')
    if (!userInfo?.companyId && !userInfo?.employeeId) {
      const response = await getAllRoleList()
      const data = response?.data?.result?.rolesList?.map((item, index) => {
        return {
          ...item,
          rowId: index + 1
        }
      })
      setUserRoles(data)
    } else {
      
      const response = await getAllCompanyRole(userInfo?.companyId)
      const data = response?.data?.result?.map((item, index) => {
        return {
          ...item,
          rowId: index + 1
        }
      })
      setUserRoles(data)
    }
  }

  const handleCloseDialog = () => {
    setLoading(false)
    setDialog({
      open: false,
      title: '',
      message: '',
      actionButtonText: ''
    })
    setRoleId(null)
  }

  const handleOpenDeleteRoleDialog = (id) => {
    setRoleId(id)
    setDialog({
      open: true,
      title: 'Delete Role',
      message: 'Are you sure! Do you want to delete this role?',
      actionButtonText: 'Delete'
    })
  }

  const handleDeleteRole = async () => {
    setLoading(true)
    if (!userInfo?.companyId && !userInfo?.employeeId) {
      const response = await deleteRole(roleid)
      if (response.data.status === 200) {
        setAlert({ open: true, message: response.data.message, type: 'success' })
        handleGetAllUserRoles()
        setLoading(false)
        handleCloseDialog()
      } else {
        setAlert({ open: true, message: response.data.message, type: 'error' })
        setLoading(false)
      }
    } else {
      const response = await deleteEmployeeRole(roleid)
      if (response.data.status === 200) {
        setAlert({ open: true, message: response.data.message, type: 'success' })
        handleGetAllUserRoles()
        setLoading(false)
        handleCloseDialog()
      } else {
        setAlert({ open: true, message: response.data.message, type: 'error' })
        setLoading(false)
      }
    }
  }

  const columns = [
    {
      field: 'rowId',
      headerName: '#',
      headerClassName: 'uppercase',
      flex: 1,
      maxWidth: 80,
    },
    {
      field: 'roleName',
      headerName: 'Role Name',
      headerClassName: 'uppercase',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'action',
      headerName: 'Action',
      headerClassName: 'uppercase',
      renderCell: (params) => {
        return (
          <div className='flex items-center gap-2 justify-center h-full'>
            <PermissionWrapper
              functionalityName="Permission"
              moduleName="Manage Roles"
              actionId={2}
              component={
                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                  <Components.IconButton onClick={() => navigate(`/dashboard/manageroles/updaterole/${params.row.roleId}`)}>
                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                  </Components.IconButton>
                </div>
              }
            />
            <PermissionWrapper
              functionalityName="Permission"
              moduleName="Manage Roles"
              actionId={3}
              component={
                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                  <Components.IconButton onClick={() => handleOpenDeleteRoleDialog(params.row.roleId)}>
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
    return row.roleId;
  }

  const habdleAddRole = () => {
    navigate('/dashboard/manageroles/addrole')
  }

  useState(() => {
    handleSetTitle("Role")
    document.title = "Manage Roles - Calculate Salary";
    handleGetAllUserRoles()
  }, [])

  const actionButtons = () => {
    return (
      <PermissionWrapper
        functionalityName="Permission"
        moduleName="Manage Roles"
        actionId={1}
        component={
          <div>
            <Button type={`button`} text={'Add Role'} onClick={() => habdleAddRole()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
          </div>
        }
      />
    )
  }

  return (
    <div className='px-3 lg:px-0'>
      <div className='border rounded-lg bg-white lg:w-full'>
        <DataTable columns={columns} rows={userRoles} getRowId={getRowId} height={420} showButtons={true} buttons={actionButtons} />
      </div>
      <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteRole} handleClose={handleCloseDialog} loading={loading} />
    </div>
  )
}

const mapDispatchToProps = {
  setAlert,
  handleSetTitle
};

export default connect(null, mapDispatchToProps)(Roles)