import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as User } from "../../../assets/svgs/user-alt.svg";
import { styled } from '@mui/material/styles';
import Components from '../../muiComponents/components';
import Button from '../../common/buttons/button';
import { Controller, useForm } from 'react-hook-form';
import Input from '../../common/input/input';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import Select from '../../common/select/select';
import { createCompanyDetails, getCompanyDetails, updateCompanyDetails, uploadCompanyLogo } from '../../../service/companyDetails/companyDetailsService';
import { uploadFiles } from '../../../service/common/commonService';
import { getAllLocations } from '../../../service/location/locationService';

const BootstrapDialog = styled(Components.Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function AddCompanyModel({ setAlert, open, handleClose, companyId, handleGetCompanyDetails }) {

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [formDataFile, setFormDataFile] = useState(null)
    const [location, setLocation] = useState([])

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            companyNo: "",
            companyName: "",
            companyAlias: "",
            companyLogo: "",
            companyLocation: ""
        },
    });

    const onClose = () => {
        setLoading(false);
        reset({
            companyNo: "",
            companyName: "",
            companyAlias: "",
            companyLogo: "",
            companyLocation: ""
        });
        handleClose();
    };

    const handleGetLocations = async () => {
        const response = await getAllLocations();
        const data = response.data.result.map((item) => {
            return {
                title: `${item.city} ,${item.state} ,${item.country}`,
                id: item.id,
            };
        });
        setLocation(data);
    }

    const submit = async (data) => {
        if (companyId) {
            setLoading(true)
            const response = await updateCompanyDetails(companyId, data);
            if (response?.data?.status === 200) {
                handleUploadImage(companyId)
                setAlert({ open: true, message: response.data.message, type: "success" })
                handleGetCompanyDetails()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }

        } else {
            setLoading(true)
            const response = await createCompanyDetails(data);
            if (response?.data?.status === 201) {
                handleUploadImage(response?.data?.result?.id)
                setAlert({ open: true, message: response.data.message, type: 'success' });
                handleGetCompanyDetails()
                onClose();
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    const handleGetCompany = async () => {
        if (companyId === null) return;

        const response = await getCompanyDetails(companyId);
        if (response.data.status === 200) {
            reset(response.data.result);
        } else {
            setAlert({ message: response.data.message, type: 'error' });
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormDataFile(file)
            setValue("companyLogo", URL.createObjectURL(file));
        }
    }

    const handleUploadImage = (companyId) => {
        if (!formDataFile) {
            return;
        }
        const formData = new FormData();
        formData.append("files", formDataFile);
        formData.append("folderName", "companyLogo");
        formData.append("userId", companyId);

        uploadFiles(formData).then((res) => {
            if (res.data.status === 200) {
                const { imageURL } = res?.data?.result?.uploadedFiles?.[0];
                uploadCompanyLogo({ companyLogo: imageURL, companyId: companyId }).then((res) => {
                    if (res.data.status !== 200) {
                        setAlert({ open: true, message: res?.data?.message, type: "error" })
                    }
                })
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" })
            }
        });
    }

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        handleGetCompany();
    }, [companyId])

    useEffect(() => {
        handleGetLocations()
    }, [])

    return (
        <React.Fragment>
            <BootstrapDialog
                open={open}
                aria-labelledby="customized-dialog-title"
                fullWidth
                maxWidth='md'
            >
                <Components.DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    {companyId ? "Update" : "Add"} Company Details
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
                        <div className="flex items-center justify-center w-full mb-4">
                            <div
                                className="h-32 w-32 border rounded-md flex items-center justify-center overflow-hidden cursor-pointer"
                                onClick={handleDivClick} // Change to handleDivClick
                            >
                                {watch("companyLogo") ? (
                                    <img
                                        src={watch("companyLogo")}
                                        alt="Preview"
                                        className="h-full w-full object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="flex justify-center items-center h-full w-full">
                                        <User height={70} width={70} fill="#CED4DA" />
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className='grid grid-cols-3 gap-3'>

                            <Controller
                                name="companyNo"
                                control={control}
                                rules={{
                                    required: "Company indentification number is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Company Indentification Number"
                                        type={`text`}
                                        error={errors.companyNo}
                                        helperText={errors.companyNo && errors.companyNo.message}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="companyName"
                                control={control}
                                rules={{
                                    required: "Company name is required",
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Company Name"
                                        type={`text`}
                                        error={errors.companyName}
                                        helperText={errors.companyName && errors.companyName.message}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="companyAlias"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Company Alias"
                                        type={`text`}
                                        onChange={(e) => {
                                            field.onChange(e);
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="companyLocation"
                                control={control}
                                rules={{
                                    required: "Company location is required",
                                }}
                                render={({ field }) => (
                                    <Select
                                        options={location}
                                        label={"Location"}
                                        placeholder="Select location"
                                        multiple={false}
                                        error={errors.companyLocation}
                                        helperText={errors.companyLocation && errors.companyLocation.message}
                                        value={watch("companyLocation") || null}
                                        onChange={(_, newValue) => {
                                            if (newValue?.id) {
                                                setValue("companyLocation", newValue.id);
                                            } else {
                                                field.onChange(null);
                                            }
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </Components.DialogContent>
                    <Components.DialogActions>
                        <div className='flex justify-end'>
                            <Button type={`submit`} text={companyId ? "Update" : "Submit"} isLoading={loading} />
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

export default connect(null, mapDispatchToProps)(AddCompanyModel)