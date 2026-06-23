import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { addModules, getModule, updateModules } from '../../../service/modules/modulesService';
import Select from '../../common/select/select';
import { getAllFunctionality } from '../../../service/functionality/functionalityService';
import { getAllActions } from '../../../service/actions/actionsService';
import Checkbox from '../../common/checkBox/checkbox';
import CustomIcons from '../../common/icons/CustomIcons';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddModuleModel({ setAlert, open, handleClose, moduleId, handleGetAllModules }) {

    const [loading, setLoading] = useState(false);
    const [functionality, setFunctionality] = useState([]);
    const [actions, setActions] = useState([]);
    const [selectedActions, setSelectedActions] = useState([]);

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            moduleName: "",
            functionalityId: "",
            actions: []
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            moduleName: "",
            functionalityId: "",
            actions: []
        });
        setSelectedActions([]);
        handleClose();
    };

    const submit = async (data) => {
        const newData = {
            ...data,
            actions: selectedActions
        }

        if (selectedActions.length === 0) {
            setError("actions", {
                type: "manual",
                message: "At least one action must be selected",
            });
            return;
        }

        if (moduleId) {
            setLoading(true)
            const response = await updateModules(moduleId, newData);
            if (response?.data?.status === 200) {
                // setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetAllModules()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }

        } else {
            setLoading(true)
            const response = await addModules(newData);
            if (response?.data?.status === 200) {
                // setAlert({ open: true, message: response.data.message, type: 'success' });
                handleGetAllModules()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    const handleGetModule = async () => {
        if (moduleId === null) return;

        const response = await getModule(moduleId);
        if (response.data.status === 200) {
            reset(response.data.result?.module);
            setSelectedActions(response.data.result?.module?.actions);
        } else {
            setAlert({ message: response.data.message, type: 'error' });
        }
    };

    const handleGetAllFunctionality = async () => {
        const response = await getAllFunctionality()
        if (response.data.status === 200) {
            const functionality = response.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.functionalityName
                }
            })
            setFunctionality(functionality)
        }
    }

    const handleGetAllActions = async () => {
        const response = await getAllActions()
        if (response.data.status === 200) {
            setActions(response.data?.result)
        }
    }

    const handleCheckboxChange = (actionId) => {
        const index = selectedActions?.indexOf(actionId);
        if (index === -1) {
            setSelectedActions([...selectedActions, actionId])
        } else {
            setSelectedActions(selectedActions.filter((item) => item !== actionId))
        }
    };

    useEffect(() => {
        handleGetModule();
    }, [moduleId])

    useEffect(() => {
        reset({
            moduleName: "",
            functionalityId: "",
            actions: []
        });
        handleGetAllFunctionality();
        handleGetAllActions()
    }, [])

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                // onClose={onClose}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='sm'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {moduleId ? "Update" : "Add"} Module
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
                        <div className='grid grid-cols-2 gap-4'>
                            <Controller
                                name="functionalityId"
                                control={control}
                                rules={{
                                    required: "Functionality is required",
                                }}
                                render={({ field }) => (
                                    <Select
                                        options={functionality}
                                        label={"Functionality *"}
                                        placeholder="Select functionality"
                                        multiple={false}
                                        error={errors.functionalityId}
                                        helperText={errors.functionalityId && errors.functionalityId.message}
                                        value={watch("functionalityId") || null} //always number or null
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                field.onChange(newValue.id);
                                            } else {
                                                field.onChange(null); //set to null
                                            }
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="moduleName"
                                control={control}
                                rules={{
                                    required: "Module name is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Module Name *"
                                        type={`text`}
                                        error={errors.moduleName}
                                        helperText={errors.moduleName && errors.moduleName.message}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div className='grid grid-cols-2 md:flex justify-start gap-4 mt-5'>
                            {actions?.map((action) => (
                                <div key={action.id}>
                                    <Checkbox
                                        text={action.actionName}
                                        checked={selectedActions?.includes(action.actionId)}
                                        onChange={() => handleCheckboxChange(action.actionId)}
                                    />
                                    <label htmlFor={action.id}>{action.name}</label>
                                </div>
                            ))}
                        </div>
                        {errors?.actions?.message && <p className="text-red-500 text-sm mt-3 ml-3">{errors?.actions?.message}</p>}
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={moduleId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddModuleModel)
