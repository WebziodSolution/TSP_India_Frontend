import { useEffect, useState } from 'react'
import CustomIcons from '../../../../common/icons/CustomIcons'
import { NavLink, useNavigate } from 'react-router-dom'
import DataTable from '../../../../common/table/table'
import { assignDefaultTemplate, deleteWeekOffTemplate, getAllWeekOffTemplate } from '../../../../../service/weeklyOff/WeeklyOffService'
import { useTheme } from '@mui/material'
import PermissionWrapper from '../../../../common/permissionWrapper/PermissionWrapper'
import Button from '../../../../common/buttons/button'
import Components from '../../../../muiComponents/components'
import AlertDialog from '../../../../common/alertDialog/alertDialog'
import AssignWeeklyOff from '../../../../models/assignWeeklyOff/assignWeeklyOff'

const WeekOffTemplates = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [weekOffTemplates, setWeekOffTemplates] = useState([])
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [id, setId] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogAssignTemplate, setDialogAssignTemplate] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [assignedEmployeeIds, setAssignedEmployeeIds] = useState([]);

    const handleOpen = (id, assignedEmployeeIds) => {
        setId(id)
        setAssignedEmployeeIds(assignedEmployeeIds)
        setOpen(true);
    }


    const handleClose = () => {
        setId(null)
        setAssignedEmployeeIds([]);
        setOpen(false);
    }

    const handleOpenDeleteDialog = (id) => {
        setId(id)
        setDialog({
            open: true,
            title: 'Delete Weekly Off Template',
            message: 'Are you sure! Do you want to delete this weekly off template?',
            actionButtonText: 'Delete'
        })
    }

    const handleCloseDialog = () => {
        setId(null)
        setLoading(false)
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
    }

    const handleOpenAssignDefaultTemplateDialog = (id, action) => {
        setId(id)
        setDialogAssignTemplate({
            open: true,
            title: 'Default Template',
            message: action === "assign" ? 'Are you sure! Do you want to set this weekly off template as default?' : 'Are you sure! Do you want to remove this weekly off template from default?',
            actionButtonText: 'Yes'
        })
    }

    const handleCloseAssignDefaultTemplateDialog = () => {
        setId(null)
        setLoading(false)
        setDialogAssignTemplate({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
    }

    const handleAssignDefaultTemplate = async () => {
        if (id) {
            setLoading(true);
            const response = await assignDefaultTemplate(id);
            if (response?.data?.status === 200) {
                setLoading(false);
                handleCloseAssignDefaultTemplateDialog();
                handleGetAllWeekOffTemplate();
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true);
        if (id) {
            const response = await deleteWeekOffTemplate(id);
            if (response?.data?.status === 200) {
                setLoading(false)
                handleCloseDialog();
                handleGetAllWeekOffTemplate();
            } else {
                setLoading(false);
                handleCloseDialog();
            }
        }
    }
    const handleGetAllWeekOffTemplate = async () => {
        if (userInfo?.companyId) {
            const response = await getAllWeekOffTemplate(userInfo.companyId);
            if (response?.data?.status === 200) {
                const data = response.data?.result?.map((item, index) => ({
                    ...item,
                    rowId: index + 1,
                }));
                setWeekOffTemplates(data);
            }
        }
    }

    useEffect(() => {
        document.title = "Manage Weekly-off Templates - Calculate Salary";
        handleGetAllWeekOffTemplate()
    }, [])

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
            headerName: 'Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'createdByUsername',
            headerName: 'Created By',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'assignedEmployeeIds',
            headerName: 'Assigned Employees',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const assignedEmployees = params.row.assignedEmployeeIds || [];
                return (
                    <div>
                        {assignedEmployees?.length}
                    </div>
                );
            }
        },
        {
            field: 'action',
            headerName: 'action',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 80,
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-start h-full'>
                        <PermissionWrapper
                            functionalityName="Automation Rules"
                            moduleName="Weekly Holidays"
                            actionId={2}
                            component={
                                params?.row?.isDefault ? (
                                    <div className='bg-gray-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenAssignDefaultTemplateDialog(params.row.id, "remove")}>
                                            <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                ) : (
                                    <div className='bg-purple-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                        <Components.IconButton onClick={() => handleOpenAssignDefaultTemplateDialog(params.row.id, "assign")}>
                                            <CustomIcons iconName={'fa-solid fa-calendar-week'} css='cursor-pointer text-white h-4 w-4' />
                                        </Components.IconButton>
                                    </div>
                                )
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Automation Rules"
                            moduleName="Weekly Holidays"
                            actionId={2}
                            component={
                                <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpen(params.row.id, params.row.assignedEmployeeIds)}>
                                        <CustomIcons iconName={'fa-solid fa-user-plus'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Automation Rules"
                            moduleName="Weekly Holidays"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => navigate(`/dashboard/automationrules/week-off/edit/${params.row.id}`)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Automation Rules"
                            moduleName="Weekly Holidays"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(params.row.id)}>
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
        return row.id || row.rowId;
    }


    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Automation Rules"
                moduleName="Weekly Holidays"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Create New Template'} onClick={() => navigate('/dashboard/automationrules/week-off/add')} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <div className='px-4 lg:px-0'>
            <div className='mb-4 w-60'>
                <NavLink to={'/dashboard/automationrules'}>
                    <div className='flex justify-start items-center gap-3'>
                        <div style={{ color: theme.palette.primary.main }}>
                            <CustomIcons iconName={'fa-solid fa-arrow-left'} css='cursor-pointer h-4 w-4' />
                        </div>
                        <p className='text-md capitalize'>Back to automation rules</p>
                    </div>
                </NavLink>
            </div>

            <div className='border rounded-lg bg-white w-screen lg:w-full p-4'>
                <div className='grow mb-4'>
                    <h2 className='text-lg font-semibold'>Weekly Off Templates</h2>
                    <p className='text-gray-600'>
                        Create and manage weekly off templates.
                    </p>
                </div>
                <DataTable columns={columns} rows={weekOffTemplates} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
                <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDelete} handleClose={handleCloseDialog} loading={loading} />
                <AlertDialog open={dialogAssignTemplate.open} title={dialogAssignTemplate.title} message={dialogAssignTemplate.message} actionButtonText={dialogAssignTemplate.actionButtonText} handleAction={handleAssignDefaultTemplate} handleClose={handleCloseAssignDefaultTemplateDialog} loading={loading} />

                <AssignWeeklyOff open={open} handleClose={handleClose} id={id} assignedEmployeeIds={assignedEmployeeIds} handleGetAllWeekOffTemplate={handleGetAllWeekOffTemplate}/>
            </div>
        </div>
    )
}

export default WeekOffTemplates