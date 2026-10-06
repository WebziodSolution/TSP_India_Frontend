import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { setAlert as setAlertAction } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';
import Input from '../../common/input/input';
import { findByMonthAndUser, saveAdditionalDeduction, deleteAdditionalDeduction } from '../../../service/additionalDeductions/additionalDeductionsService';
import AlertDialog from '../../common/alertDialog/alertDialog';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2.5),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1.5),
    },
}));

export function AdditionalDeductionsModel({
    open,
    handleClose,
    month,
    userId,
    userName,
    employeeName,
    onSuccess,
    setAlert,
}) {
    const theme = useTheme();
    const dispatch = useDispatch();
    const displayName = userName || employeeName;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        id: null,
        type: null,
        index: null,
        title: '',
        message: '',
    });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const showAlert = (alertObj) => {
        if (typeof setAlert === 'function') {
            setAlert(alertObj);
        } else {
            dispatch(setAlertAction(alertObj));
        }
    };

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            allowances: [],
            deductions: [],
        },
    });

    const {
        fields: allowanceFields,
        append: appendAllowance,
        remove: removeAllowance,
    } = useFieldArray({
        control,
        name: 'allowances',
    });

    const {
        fields: deductionFields,
        append: appendDeduction,
        remove: removeDeduction,
    } = useFieldArray({
        control,
        name: 'deductions',
    });

    const watchedAllowances = watch('allowances') || [];
    const watchedDeductions = watch('deductions') || [];

    const totalAllowance = watchedAllowances.reduce(
        (sum, item) => sum + (parseFloat(item?.amount) || 0),
        0
    );

    const totalDeductions = watchedDeductions.reduce(
        (sum, item) => sum + (parseFloat(item?.amount) || 0),
        0
    );

    const handleGetData = async () => {
        if (!open || !userId || !month) return;

        setFetching(true);
        try {
            const response = await findByMonthAndUser(month, userId);
            if (response?.data?.status === 200 && Array.isArray(response?.data?.result) && response.data.result.length > 0) {
                const rawList = response.data.result;

                const mappedAllowances = rawList
                    .filter((item) => item?.type === 'Allowance')
                    .map((item) => ({
                        id: item.id || null,
                        title: item.title || '',
                        amount: item.amount ?? '',
                    }));

                const mappedDeductions = rawList
                    .filter((item) => item?.type === 'Deduction')
                    .map((item) => ({
                        id: item.id || null,
                        title: item.title || '',
                        amount: item.amount ?? '',
                    }));

                reset({
                    allowances: mappedAllowances,
                    deductions: mappedDeductions,
                });
            } else {
                reset({
                    allowances: [],
                    deductions: [],
                });
            }
        } catch (error) {
            console.error('Error fetching additional deductions:', error);
            reset({
                allowances: [],
                deductions: [],
            });
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (open) {
            handleGetData();
        }
    }, [open, userId, month]);

    const onClose = () => {
        reset({
            allowances: [],
            deductions: [],
        });
        setLoading(false);
        setFetching(false);
        handleClose();
    };

    const submit = async (data) => {
        if (!userId || !month) {
            showAlert({
                open: true,
                message: 'User ID or Month information is missing',
                type: 'error',
            });
            return;
        }

        const validAllowances = (data.allowances || [])
            .filter((item) => item?.title?.trim() || item?.amount)
            .map((item) => ({
                id: item.id ? parseInt(item.id) : null,
                userId: parseInt(userId),
                month: String(month),
                title: item.title?.trim(),
                amount: String(item.amount),
                type: 'Allowance',
            }));

        const validDeductions = (data.deductions || [])
            .filter((item) => item?.title?.trim() || item?.amount)
            .map((item) => ({
                id: item.id ? parseInt(item.id) : null,
                userId: parseInt(userId),
                month: String(month),
                title: item.title?.trim(),
                amount: String(item.amount),
                type: 'Deduction',
            }));

        const payload = [...validAllowances, ...validDeductions];

        if (payload.length === 0) {
            showAlert({
                open: true,
                message: 'Please add at least one allowance or deduction',
                type: 'error',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await saveAdditionalDeduction(payload);
            if (response?.data?.status === 201 || response?.data?.status === 200) {
                setLoading(false);
                showAlert({
                    open: true,
                    message: response?.data?.message || 'Additional deductions saved successfully',
                    type: 'success',
                });
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
                onClose();
            } else {
                setLoading(false);
                showAlert({
                    open: true,
                    message: response?.data?.message || 'Failed to save additional deductions',
                    type: 'error',
                });
            }
        } catch (error) {
            console.error('Error submitting additional deductions:', error);
            setLoading(false);
            showAlert({
                open: true,
                message: error?.response?.data?.message || 'Error submitting additional deductions',
                type: 'error',
            });
        }
    };

    const handleDeleteClick = (type, index) => {
        const list = type === 'Allowance' ? watch('allowances') : watch('deductions');
        const currentItem = list?.[index];
        const targetId = currentItem?.id;

        if (targetId) {
            setDeleteDialog({
                open: true,
                id: targetId,
                type: type,
                index: index,
                title: `Delete ${type}`,
                message: `Are you sure you want to delete this ${type.toLowerCase()} (${currentItem?.title || 'item'})?`,
            });
        } else {
            if (type === 'Allowance') {
                removeAllowance(index);
            } else {
                removeDeduction(index);
            }
        }
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialog({
            open: false,
            id: null,
            type: null,
            index: null,
            title: '',
            message: '',
        });
        setDeleteLoading(false);
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.id) return;

        setDeleteLoading(true);
        try {
            const response = await deleteAdditionalDeduction(deleteDialog.id);
            if (response?.data?.status === 200) {
                showAlert({
                    open: true,
                    message: response?.data?.message || `${deleteDialog.type} deleted successfully`,
                    type: 'success',
                });
                if (deleteDialog.index !== null) {
                    if (deleteDialog.type === 'Allowance') {
                        removeAllowance(deleteDialog.index);
                    } else {
                        removeDeduction(deleteDialog.index);
                    }
                }
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
                handleCloseDeleteDialog();
            } else {
                showAlert({
                    open: true,
                    message: response?.data?.message || `Failed to delete ${deleteDialog.type?.toLowerCase()}`,
                    type: 'error',
                });
                setDeleteLoading(false);
            }
        } catch (error) {
            console.error('Error deleting additional deduction:', error);
            showAlert({
                open: true,
                message: error?.response?.data?.message || `Error deleting ${deleteDialog.type?.toLowerCase()}`,
                type: 'error',
            });
            setDeleteLoading(false);
        }
    };

    const handleAmountChange = (e, fieldOnChange) => {
        let value = e.target.value;
        // 1. Remove any character that isn't a digit or a dot
        value = value.replace(/[^0-9.]/g, '');
        // 2. Prevent multiple dots (keep only the first one)
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        // 3. Limit to 2 digits after the dot
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        fieldOnChange(value);
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="additional-deductions-dialog-title"
                fullWidth
                maxWidth="lg"
            >
                <Components.DialogTitle
                    sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }}
                    id="additional-deductions-dialog-title"
                >
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold">Additional Allowances & Deductions</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-normal mt-0.5">
                            {displayName && (
                                <span>
                                    Employee: <span className="font-semibold text-gray-800">{displayName}</span>
                                </span>
                            )}
                            {displayName && month && <span className="text-gray-300">•</span>}
                            {month && (
                                <span>
                                    For Month: <span className="font-semibold text-gray-800">{month}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </Components.DialogTitle>

                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    }}
                >
                    <CustomIcons iconName="fa-solid fa-xmark" css="cursor-pointer text-black w-5 h-5" />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        {fetching ? (
                            <div className="flex flex-col justify-center items-center py-20 gap-3">
                                <CircularProgress size={32} />
                                <span className="text-xs text-gray-500">Loading details...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* ================= LEFT SECTION: ALLOWANCES ================= */}
                                <div className="flex flex-col border border-emerald-200 bg-emerald-50/20 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/80">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-emerald-800 text-sm">
                                                Allowances
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
                                                ₹{totalAllowance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => appendAllowance({ id: null, title: '', amount: '' })}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition shadow-sm"
                                        >
                                            <CustomIcons iconName="fa-solid fa-plus" css="text-white text-xs" />
                                            <span>Add Allowance</span>
                                        </button>
                                    </div>

                                    {allowanceFields.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                            <p className="text-xs font-medium text-gray-600">No allowances added yet</p>
                                            <button
                                                type="button"
                                                onClick={() => appendAllowance({ id: null, title: '', amount: '' })}
                                                className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                                            >
                                                + Click to add allowance
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                            {allowanceFields.map((fieldItem, index) => (
                                                <div
                                                    key={fieldItem.id || index}
                                                    className="p-3 bg-white border border-emerald-200/90 rounded-lg hover:border-emerald-300 transition shadow-xs"
                                                >
                                                    <div className="grid grid-cols-12 gap-3 items-start">
                                                        <div className="col-span-12 sm:col-span-6">
                                                            <Controller
                                                                name={`allowances.${index}.title`}
                                                                control={control}
                                                                rules={{
                                                                    required: 'Title is required',
                                                                    validate: (val) =>
                                                                        (val && val.trim() !== '') || 'Title cannot be empty',
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Title"
                                                                        placeholder="e.g. Bonus, Travel"
                                                                        error={errors?.allowances?.[index]?.title}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="col-span-9 sm:col-span-5">
                                                            <Controller
                                                                name={`allowances.${index}.amount`}
                                                                control={control}
                                                                rules={{
                                                                    required: 'Amount is required',
                                                                    min: { value: 0.01, message: 'Must be > 0' },
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        type="text"
                                                                        label="Amount (₹)"
                                                                        placeholder="0.00"
                                                                        error={errors?.allowances?.[index]?.amount}
                                                                        onChange={(e) => handleAmountChange(e, field.onChange)}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="col-span-3 sm:col-span-1 flex justify-center items-center pt-1.5">
                                                            <Components.IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick('Allowance', index)}
                                                                title="Remove Allowance"
                                                                sx={{
                                                                    color: '#ef4444',
                                                                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                                                                }}
                                                            >
                                                                <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 text-sm" />
                                                            </Components.IconButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ================= RIGHT SECTION: DEDUCTIONS ================= */}
                                <div className="flex flex-col border border-rose-200 bg-rose-50/20 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-200/80">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-rose-800 text-sm">
                                                Deductions
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300">
                                                ₹{totalDeductions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => appendDeduction({ id: null, title: '', amount: '' })}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer transition shadow-sm"
                                        >
                                            <CustomIcons iconName="fa-solid fa-plus" css="text-white text-xs" />
                                            <span>Add Deduction</span>
                                        </button>
                                    </div>

                                    {deductionFields.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                            <p className="text-xs font-medium text-gray-600">No deductions added yet</p>
                                            <button
                                                type="button"
                                                onClick={() => appendDeduction({ id: null, title: '', amount: '' })}
                                                className="mt-2 text-xs font-semibold text-rose-600 hover:underline"
                                            >
                                                + Click to add deduction
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                            {deductionFields.map((fieldItem, index) => (
                                                <div
                                                    key={fieldItem.id || index}
                                                    className="p-3 bg-white border border-rose-200/90 rounded-lg hover:border-rose-300 transition shadow-xs"
                                                >
                                                    <div className="grid grid-cols-12 gap-3 items-start">
                                                        <div className="col-span-12 sm:col-span-6">
                                                            <Controller
                                                                name={`deductions.${index}.title`}
                                                                control={control}
                                                                rules={{
                                                                    required: 'Title is required',
                                                                    validate: (val) =>
                                                                        (val && val.trim() !== '') || 'Title cannot be empty',
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Title"
                                                                        placeholder="e.g. Loan, Penalty"
                                                                        error={errors?.deductions?.[index]?.title}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="col-span-9 sm:col-span-5">
                                                            <Controller
                                                                name={`deductions.${index}.amount`}
                                                                control={control}
                                                                rules={{
                                                                    required: 'Amount is required',
                                                                    min: { value: 0.01, message: 'Must be > 0' },
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        type="text"
                                                                        label="Amount (₹)"
                                                                        placeholder="0.00"
                                                                        error={errors?.deductions?.[index]?.amount}
                                                                        onChange={(e) => handleAmountChange(e, field.onChange)}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="col-span-3 sm:col-span-1 flex justify-center items-center pt-1.5">
                                                            <Components.IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick('Deduction', index)}
                                                                title="Remove Deduction"
                                                                sx={{
                                                                    color: '#ef4444',
                                                                    '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                                                                }}
                                                            >
                                                                <CustomIcons iconName="fa-solid fa-trash" css="text-red-500 text-sm" />
                                                            </Components.IconButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Components.DialogContent>

                    <Components.DialogActions>
                        <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <div>
                                <Button
                                    type="submit"
                                    text="Save"
                                    isLoading={loading}
                                    disabled={fetching}
                                />
                            </div>
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>

            <AlertDialog
                open={deleteDialog.open}
                title={deleteDialog.title}
                message={deleteDialog.message}
                actionButtonText="Delete"
                handleAction={handleConfirmDelete}
                handleClose={handleCloseDeleteDialog}
                loading={deleteLoading}
            />
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    setAlert: setAlertAction,
};

export default connect(null, mapDispatchToProps)(AdditionalDeductionsModel);