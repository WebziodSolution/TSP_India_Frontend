import { useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import CustomIcons from '../../../../common/icons/CustomIcons';
import Button from '../../../../common/buttons/button';
import { useEffect, useState } from 'react';
import Components from '../../../../muiComponents/components';
import DataTable from '../../../../common/table/table';
import AlertDialog from '../../../../common/alertDialog/alertDialog';
import PermissionWrapper from '../../../../common/permissionWrapper/PermissionWrapper';
import { deleteAttendancePenaltyRule, findAllAttendancePenaltyRuleByCompanyId } from '../../../../../service/attendancePenaltyRules/attendancePenaltyRuleService';
import AddEarlyExit from '../../../../models/addEarlyExit/addEarlyExit';

const AddEarlyExitTemplates = () => {
    const theme = useTheme();
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const [row, setRow] = useState([]);
    const [open, setOpen] = useState(false);
    const [id, setId] = useState(null);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);

    const handleOpenDeleteOvertimeDialog = (id) => {
        setId(id)
        setDialog({
            open: true,
            title: 'Delete Late Entry Rule',
            message: 'Are you sure! Do you want to delete this late entry rule?',
            actionButtonText: 'Delete'
        })
    }

    const handleCloseDialog = () => {
        setLoading(false)
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
    }

    const handleDelete = async () => {
        const response = await deleteAttendancePenaltyRule(id);
        if (response?.data?.status === 200) {
            setId(null);
            handleCloseDialog();
            handleAttendancePenaltyRule();
        }
    }

    const handleOpen = (id) => {
        setId(id);
        setOpen(true);
    }

    const handleClose = () => {
        setId(null);
        setOpen(false);
    }

    const handleAttendancePenaltyRule = async () => {
        if (userInfo?.companyId) {
            const response = await findAllAttendancePenaltyRuleByCompanyId(1, userInfo?.companyId);
            if (response?.data?.status === 200) {
                const data = response?.data?.result?.map((item, index) => ({
                    ...item,
                    rowId: index + 1,
                }));
                setRow(data);
            }
        }
    }

    useEffect(() => {
        document.title = "Manage Early-Exit Rules - Calculate Salary";
        handleAttendancePenaltyRule();
    }, []);

    const columns = [
        {
            field: 'rowId',
            headerName: 'id',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 80
        },
        {
            field: 'ruleName',
            headerName: 'Rule Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'createdByUserName',
            headerName: 'Created By',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'minutes',
            headerName: 'Minutes',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                return (
                    <>
                        {params.row.minutes ? `${params.row.minutes} min` : 'N/A'}
                    </>
                );
            }
        },
        {
            field: 'deductionType',
            headerName: 'Deduction Type',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                return (
                    <>
                        {params.row.deductionType ? `${params.row.deductionType}` : '-'}
                    </>
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
                            moduleName="Early Exit Rules"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpen(params.row.id)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />

                        <PermissionWrapper
                            functionalityName="Automation Rules"
                            moduleName="Early Exit Rules"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDeleteOvertimeDialog(params.row.id)}>
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
                moduleName="Early Exit Rules"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Create Early Exit Rule'} onClick={() => handleOpen(null)} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
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
                    <h2 className='text-lg font-semibold'>Early Exit Rules</h2>
                    <p className='text-gray-600'>
                        Create and manage early exit templates.
                    </p>
                </div>
                <DataTable columns={columns} rows={row} getRowId={getRowId} height={480} showButtons={true} buttons={actionButtons} />
            </div>

            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDelete} handleClose={handleCloseDialog} loading={loading} />
            <AddEarlyExit open={open} handleClose={handleClose} id={id} handleAttendancePenaltyRule={handleAttendancePenaltyRule} />
        </div>
    )
}

export default AddEarlyExitTemplates