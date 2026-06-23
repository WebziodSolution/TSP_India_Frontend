import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { addContractor, getContractor, updateContractor } from '../../../service/contractor/contractorService';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import CustomIcons from '../../common/icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export function AddContractorModel({ setAlert, open, handleClose, contractorId }) {
    const theme = useTheme()

    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            contractorName: ""
        },
    });

    const onClose = () => {
        reset({
            contractorName: ""
        });
        setLoading(false);
        handleClose();
    };

    const submit = async (data) => {
        if (contractorId) {
            setLoading(true)
            const response = await updateContractor(contractorId, data);
            if (response?.data?.status === 200) {
                // setAlert({ open: true, message: response.data.message, type: "success" })
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }

        } else {
            setLoading(true)
            const response = await addContractor(data);
            if (response?.data?.status === 201) {
                // setAlert({ open: true, message: response.data.message, type: 'success' });
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    const handleGetContractor = async () => {
        if (contractorId) {
            const response = await getContractor(contractorId);
            if (response.data.status === 200) {
                reset(response.data.result);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
        }
    }

    useEffect(() => {
        handleGetContractor();
    }, [contractorId])

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                // onClose={onClose}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2, color: theme.palette.primary.text.main }} id="customized-dialog-title">
                    {contractorId ? "Update" : "Add"} Contractor
                </Components.DialogTitle>
                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.primary.icon,
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <Controller
                            name="contractorName"
                            control={control}
                            rules={{
                                required: "Contractor name is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Contractor Name *"
                                    type={`text`}
                                    error={errors.contractorName}
                                    // helperText={errors.contractorName && errors.contractorName.message}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={contractorId ? "Update" : "Submit"} isLoading={loading} />
                        </div>
                    </Components.DialogActions>
                </form>
            </BootstrapDialog>
        </React.Fragment>
    );
}


const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(AddContractorModel)
