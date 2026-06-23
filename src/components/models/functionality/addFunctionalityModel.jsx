import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { addFunctionality, getFunctionality, updateFunctionality } from '../../../service/functionality/functionalityService';
import CustomIcons from '../../common/icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddFunctionalityModel({ setAlert, open, handleClose, functionalityId, handleGetAllFunctionality }) {

    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            functionalityName: ""
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            functionalityName: ""
        });
        handleClose();
    };

    const submit = async (data) => {
        if (functionalityId) {
            setLoading(true)
            const response = await updateFunctionality(functionalityId, data);
            if (response?.data?.status === 200) {
                // setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetAllFunctionality()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }

        } else {
            setLoading(true)
            const response = await addFunctionality(data);
            if (response?.data?.status === 201) {
                // setAlert({ open: true, message: response.data.message, type: 'success' });
                handleGetAllFunctionality()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    const handleGetFunctionality = async () => {
        if (!functionalityId) return;

        const response = await getFunctionality(functionalityId);
        if (response.data.status === 200) {
            reset(response.data.result);
        } else {
            setAlert({ message: response.data.message, type: 'error' });
        }
    };


    useEffect(() => {
        handleGetFunctionality();
    }, [functionalityId])

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {functionalityId ? "Update" : "Add"} Functionality
                </Components.DialogTitle>
                <Components.IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-black w-5 h-5' />
                </Components.IconButton>

                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Components.DialogContent dividers>
                        <Controller
                            name="functionalityName"
                            control={control}
                            rules={{
                                required: "Functionality name is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Functionality Name"
                                    type={`text`}
                                    error={errors.functionalityName}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={functionalityId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddFunctionalityModel)
