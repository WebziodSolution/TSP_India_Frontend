import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as User } from "../../../../assets/svgs/user-alt.svg";

import Stapper from '../../../common/stapper/stapper';
import { Controller, useForm } from 'react-hook-form';
import Button from '../../../common/buttons/button';
import Input from '../../../common/input/input';
import Select from '../../../common/select/select';
import DataTable from '../../../common/table/table';

import { getAllCountry } from '../../../../service/country/countryService';
import { getAllStateByCountry } from '../../../../service/state/stateService';

import { getAllDepartment } from '../../../../service/department/departmentService';
import { connect } from 'react-redux';
import { handleSetTitle, setAlert } from '../../../../redux/commonReducers/commonReducers';
import Components from '../../../muiComponents/components';
import AlertDialog from '../../../common/alertDialog/alertDialog';
import { createUser, deleteUser, getAllUsers, getUser, updateUser, uploadProfileImage } from '../../../../service/users/usersServices';
import { getAllRoles } from '../../../../service/roles/roleService';
import PermissionWrapper from '../../../common/permissionWrapper/PermissionWrapper';
import DatePickerComponent from '../../../common/datePickerComponent/datePickerComponent';
import { uploadFiles } from '../../../../service/common/commonService';
import CustomIcons from '../../../common/icons/CustomIcons';
import { useTheme } from '@mui/material';

const steps = [
    "User General Info",
    "User Personal Info",
    "Set User Pin",
];

const GenderOptions = [
    { id: 1, title: "Male" },
    { id: 2, title: "Female" }
]

const AddUser = ({ setAlert, handleSetTitle }) => {
    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            userName: "",
            gender: '',
            password: '',
            confirmPassword: '',
            personalIdentificationNumber: '',
            companyLocation: '',
            departmentId: '',
            roleId: '',
            userShiftId: '',
            contractorId: '',
            address1: '',
            address2: '',
            state: '',
            city: '',
            country: '',
            email: '',
            zipCode: '',
            birthDate: (() => {
                const today = new Date();
                return `${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getDate().toString().padStart(2, "0")}/${today.getFullYear()}`;
            })(),
            emergencyContact: '',
            contactPhone: '',
            relationship: '',
            phone: ''
        },
    });
    const theme = useTheme()

    const fileInputRef = useRef(null);

    const [formDataFile, setFormDataFile] = useState(null)

    const [countryData, setCountryData] = useState([])
    const [stateData, setStateData] = useState([])

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const [isAddEmployee, setIsAddEmployee] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [rows, setRows] = useState([]);
    const [userId, setUserId] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [userRoles, setUserRoles] = useState([]);

    const [passwordError, setPasswordError] = useState([
        {
            condition: (value) => value.length >= 8,
            message: 'Minimum 8 characters long',
            showError: true,
        },
        {
            condition: (value) => /[a-z]/.test(value),
            message: 'At least one lowercase character',
            showError: true,
        },
        {
            condition: (value) => /[\d@$!%*?&\s]/.test(value),
            message: 'At least one number, symbol, or whitespace character',
            showError: true,
        },
    ]);

    // const [showPasswordRequirement, setShowPasswordRequirement] = useState(false)


    const validatePassword = (value) => {
        const updatedErrors = passwordError.map((error) => ({
            ...error,
            showError: !error.condition(value),
        }));
        setPasswordError(updatedErrors);
        return updatedErrors.every((error) => !error.showError) || 'Password does not meet all requirements.';
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible((prev) => !prev);
    };


    const handleGetAllUsers = async () => {
        if (!isAddEmployee) {
            const response = await getAllUsers()
            if (response?.data?.result?.length > 0) {
                const data = response?.data?.result?.map((item, index) => {
                    return {
                        ...item,
                        rowId: index + 1
                    }
                })
                setRows(data)
            }
        }
    }

    const handleGetUser = async (id) => {
        if (id !== null) {
            const response = await getUser(id)
            if (response?.data?.result) {
                await handleGetAllStatesByCountryId(countryData?.filter((item) => item.title === response?.data?.result?.country)?.[0]?.id)
                reset(response?.data?.result)
                setValue("gender", response?.data?.result?.gender === "Male" ? 1 : 2)
                validatePassword(response?.data?.result?.password)
                setValue("confirmPassword", response?.data?.result?.password)
            }
        }
    }

    const handleGetAllDepartment = async () => {
        if (isAddEmployee) {
            const response = await getAllDepartment()
            const data = response?.data?.result?.map((item) => {
                return {
                    id: item.id,
                    title: item.departmentName
                }
            })
            setDepartments(data)
        }
    }

    const handleGetAllUserRoles = async () => {
        if (isAddEmployee) {
            const response = await getAllRoles()
            const data = response?.data?.result?.map((item) => {
                return {
                    id: item.roleId,
                    title: item.roleName
                }
            })
            setUserRoles(data)
        }
    }

    const handleBack = () => {
        if (activeStep === 0) {
            handleSetTitle("Manage User")
            setIsAddEmployee(false)
            reset("")
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }
    };

    const handleAddUsers = () => {
        handleSetTitle("Add User")
        reset({
            firstName: '',
            middleName: '',
            lastName: '',
            gender: '',
            personalIdentificationNumber: '',
            companyLocation: '',
            departmentId: '',
            roleId: '',
            userShiftId: '',
            contractorId: '',
            address1: '',
            address2: '',
            state: '',
            city: '',
            country: '',
            email: '',
            zipCode: '',
            homePhone: '',
            mobilePhone: '',
            birthDate: (() => {
                const today = new Date();
                return `${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getDate().toString().padStart(2, "0")}/${today.getFullYear()}`;
            })(),
            emergencyContact: '',
            contactPhone: '',
            relationship: '',
            phone: '',
            profileImage: ""
        })
        setValue("personalIdentificationNumber", `TimeSheetsPro-${Math.floor(100000 + Math.random() * 900000)}`)
        setIsAddEmployee(true)
    }

    const handleUpdateUser = (id) => {
        handleSetTitle("Update User")
        setUserId(id)
        setIsAddEmployee(true)
        setActiveStep(0)
        handleGetUser(id)
    }

    const handleDeleteUser = async () => {
        setLoading(true)
        const response = await deleteUser(userId)

        if (response?.data?.status === 200) {
            setAlert({ open: true, message: response.data.message, type: "success" })
            setDialog({ open: false, title: '', message: '', actionButtonText: '' })
            setUserId(null)
            setLoading(false)
            handleGetAllUsers()
        } else {
            setAlert({ open: true, message: response.data.message, type: "error" })
            setLoading(false)
        }
    }

    const handleOpenDialog = (id) => {
        setUserId(id)
        setDialog({
            open: true,
            title: "Delete Employee",
            message: "Are you sure! Do you want to delete this employee?",
            actionButtonText: "Delete",
        })
    }

    const handleCloseDialog = () => {
        setUserId(null)
        setDialog({
            open: false,
            title: "",
            message: "",
            actionButtonText: "",
        })
    }

    const submit = async (data) => {
        const newData = {
            ...data,
            gender: parseInt(watch("gender")) === 1 ? "Male" : "Female"
        }
        if (steps?.length - 1 === activeStep) {
            // if (passwordError.some((row) => row.showError === true) || (data.password === "" || data.password === null)) {
            //     return;
            // }
            if (userId !== null) {
                setLoading(true)
                const response = await updateUser(userId, newData)
                if (response?.data?.status === 200) {
                    handleUploadImage(userId)
                    setUserId(null)
                    // setAlert({ open: true, message: response.data.message, type: "success" })
                    setLoading(false)
                    setIsPasswordVisible(false)
                    setIsConfirmPasswordVisible(false)
                    reset({
                        firstName: '',
                        middleName: '',
                        lastName: '',
                        gender: '',
                        personalIdentificationNumber: '',
                        companyLocation: '',
                        departmentId: '',
                        roleId: '',
                        userShiftId: '',
                        contractorId: '',
                        address1: '',
                        address2: '',
                        state: '',
                        city: '',
                        country: '',
                        email: '',
                        zipCode: '',
                        homePhone: '',
                        mobilePhone: '',
                        birthDate: '',
                        emergencyContact: '',
                        contactPhone: '',
                        relationship: '',
                        phone: '',
                    })
                    setIsAddEmployee(false)
                    handleSetTitle("Manage User")
                    setActiveStep(0)
                } else {
                    setAlert({ open: true, message: response.data.message, type: "error" })
                    setLoading(false)
                }
            } else {
                setLoading(true)
                const response = await createUser(newData)
                if (response?.data?.status === 201) {
                    // setAlert({ open: true, message: response.data.message, type: "success" })
                    handleUploadImage(response?.data?.result?.userId)
                    reset({
                        firstName: '',
                        middleName: '',
                        lastName: '',
                        gender: '',
                        personalIdentificationNumber: '',
                        companyLocation: '',
                        departmentId: '',
                        roleId: '',
                        userShiftId: '',
                        contractorId: '',
                        address1: '',
                        address2: '',
                        state: '',
                        city: '',
                        country: '',
                        email: '',
                        zipCode: '',
                        homePhone: '',
                        mobilePhone: '',
                        birthDate: '',
                        emergencyContact: '',
                        contactPhone: '',
                        relationship: '',
                        phone: '',
                    })
                    setLoading(false)
                    setIsAddEmployee(false)
                    setIsPasswordVisible(false)
                    setIsConfirmPasswordVisible(false)
                    handleSetTitle("Manage User")
                    setActiveStep(0)
                } else {
                    setAlert({ open: true, message: response.data.message, type: "error" })
                    setLoading(false)
                }
            }
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    }

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormDataFile(file)
            setValue("profileImage", URL.createObjectURL(file));
        }
    }

    const handleUploadImage = (userId) => {
        if (!formDataFile) {
            return;
        }
        const formData = new FormData();
        formData.append("files", formDataFile);
        formData.append("folderName", "profileImages");
        formData.append("userId", userId);

        uploadFiles(formData).then((res) => {
            if (res.data.status === 200) {
                const { imageURL } = res?.data?.result?.uploadedFiles?.[0];
                uploadProfileImage({ profileImage: imageURL, userId: userId }).then((res) => {
                    if (res.data.status !== 200) {
                        setAlert({ open: true, message: res?.data?.message, type: "error" })
                    }
                })
            } else {
                setAlert({ open: true, message: res?.data?.message, type: "error" })
            }
        });
    }

    const columns = [
        {
            field: 'rowId',
            headerName: '#',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 50
        },
        {
            field: 'firstName',
            headerName: 'FirstName',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'lastName',
            headerName: 'LastName',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'email',
            headerName: 'Email',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 140
        },
        {
            field: 'phone',
            headerName: 'Phone',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'gender',
            headerName: 'Gender',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'city',
            headerName: 'City',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'country',
            headerName: 'Country',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'state',
            headerName: 'State',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100
        },
        {
            field: 'action',
            headerName: 'Action',
            headerClassName: 'uppercase',
            renderCell: (params) => {
                return (
                    <div className='flex items-center gap-2 justify-center h-full'>
                        <PermissionWrapper
                            functionalityName="Users"
                            moduleName="User"
                            actionId={2}
                            component={
                                <div className='bg-blue-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleUpdateUser(params.row.userId)}>
                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                    </Components.IconButton>
                                </div>
                            }
                        />
                        <PermissionWrapper
                            functionalityName="Users"
                            moduleName="User"
                            actionId={3}
                            component={
                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                    <Components.IconButton onClick={() => handleOpenDialog(params.row.userId)}>
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

    const getUsersId = (row) => {
        return row.userId;
    }

    const handleGetAllCountrys = async () => {
        const res = await getAllCountry()
        const data = res?.data?.result?.map((item) => {
            return {
                id: item.id,
                title: item.cntName
            }
        })
        setCountryData(data)
    }

    const handleGetAllStatesByCountryId = async (id) => {
        const res = await getAllStateByCountry(id)
        const data = res?.data?.result?.map((item) => {
            return {
                ...item,
                id: item.id,
                title: item.stateLong
            }
        })
        setStateData(data)
        if (watch("state")) {
            const selectedState = data?.filter((row) => row?.stateShort === watch("state"))?.[0] || null
            setValue("state", selectedState?.id)
        }
    }

    useEffect(() => {
        handleGetAllUsers()
        handleGetAllDepartment()
        handleGetAllUserRoles()
        handleGetAllCountrys()        
        if (!isAddEmployee) {
            handleSetTitle("Manage User")
        }
    }, [isAddEmployee])


    const actionButtons = () => {
        return (
            <PermissionWrapper
                functionalityName="Users"
                moduleName="User"
                actionId={1}
                component={
                    <div>
                        <Button type={`button`} text={'Add User'} onClick={() => handleAddUsers()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
                    </div>
                }
            />
        )
    }

    return (
        <div className='px-3 lg:px-0'>
            {isAddEmployee ? (
                <div className='py-4 px-4 lg:px-8 border rounded-lg bg-white '>
                    <div className='flex justify-start items-start gap-6 relative'>
                        <div className='self-stretch p-3 inline-flex flex-col justify-start items-start gap-2'>
                            <div className='xl:w-64'>
                                <Stapper steps={steps} activeStep={activeStep} orientation={`vertical`} labelFontSize="16px" />
                            </div>
                        </div>

                        <div className='py-3 md:py-0 xl:w-[800px] xl:px-24'>
                            <form onSubmit={handleSubmit(submit)}>
                                <div className='flex justify-center items-center'>
                                    <div className='lg:w-[35rem]'>
                                        {activeStep === 0 && (
                                            <>
                                                <div className='mb-5 font-medium text-center text-[28px] text-[#262B43]'>
                                                    <p style={{ color: theme.palette.primary.text.main, }}>User General Info</p>
                                                </div>
                                                <div className='grid grid-row gap-3'>
                                                    <div className="flex items-center justify-center w-full">
                                                        <div
                                                            className="h-32 w-32 border rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                                                            onClick={handleDivClick} // Change to handleDivClick
                                                        >
                                                            {watch("profileImage") ? (
                                                                <img
                                                                    src={watch("profileImage")}
                                                                    alt="Preview"
                                                                    className="h-full w-full object-cover rounded-full"
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

                                                    <div className='grid grid-cols-8 gap-4'>
                                                        <div className='col-span-5'>
                                                            <Controller
                                                                name="firstName"
                                                                control={control}
                                                                rules={{
                                                                    required: "First name is required",
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="First name"
                                                                        type={`text`}
                                                                        error={errors.firstName}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-3'>
                                                            <Controller
                                                                name="middleName"
                                                                rules={{
                                                                    required: "Middle name is required",
                                                                }}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Middle name"
                                                                        type={`text`}
                                                                        error={errors.middleName}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <Controller
                                                            name="lastName"
                                                            control={control}
                                                            rules={{
                                                                required: "Last name is required",
                                                            }}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    label="Last Name"
                                                                    type={`text`}
                                                                    error={errors.lastName}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        <Controller
                                                            name="userName"
                                                            control={control}
                                                            rules={{
                                                                required: "Username is required",
                                                            }}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    label="User Name"
                                                                    type={`text`}
                                                                    error={errors.userName}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className='grid grid-cols-8 gap-4'>
                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="gender"
                                                                control={control}
                                                                rules={{
                                                                    required: "Gender is required",
                                                                }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={GenderOptions}
                                                                        label={"Gender"}
                                                                        placeholder="Select Gender"
                                                                        error={errors.gender}
                                                                        value={parseInt(watch("gender")) || null}
                                                                        onChange={(_, newValue) => {
                                                                            if (newValue?.id) {
                                                                                field.onChange(newValue.id);
                                                                            } else {
                                                                                setValue("gender", null);
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="personalIdentificationNumber"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Personal identification"
                                                                        type={`text`}
                                                                        disabled={true}
                                                                    // onChange={(e) => {
                                                                    //     field.onChange(e);
                                                                    // }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-8 gap-4'>
                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="departmentId"
                                                                control={control}
                                                                rules={{
                                                                    required: "Department is required",
                                                                }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={departments}
                                                                        error={errors.departmentId}
                                                                        label={"Department"}
                                                                        placeholder="Select department"
                                                                        value={watch("departmentId") || null}
                                                                        onChange={(_, newValue) => {
                                                                            if (newValue?.id) {
                                                                                field.onChange(newValue.id);
                                                                            } else {
                                                                                setValue("departmentId", null);
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="roleId"
                                                                control={control}
                                                                rules={{
                                                                    required: "Position is required",
                                                                }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={userRoles}
                                                                        error={errors.roleId}
                                                                        label={"Position"}
                                                                        placeholder="Select position"

                                                                        value={watch("roleId") || null}
                                                                        onChange={(_, newValue) => {
                                                                            if (newValue?.id) {
                                                                                field.onChange(newValue.id);
                                                                            } else {
                                                                                setValue("roleId", null);
                                                                            }
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeStep === 1 && (
                                            <>
                                                <div className='mb-5 font-medium text-center text-[28px] text-[#262B43]'>
                                                    <p style={{ color: theme.palette.primary.text.main, }}>User Personal Info</p>
                                                </div>
                                                <div className='grid grid-row gap-3'>
                                                    <div className='grid grid-cols-8 gap-4'>
                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="country"
                                                                control={control}
                                                                rules={{
                                                                    required: "Country is required"
                                                                }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        options={countryData}
                                                                        label={"Country"}
                                                                        placeholder="Select country"
                                                                        value={countryData?.filter((row) => row.title === watch("country"))?.[0]?.id || null}
                                                                        onChange={(_, newValue) => {
                                                                            if (newValue?.id) {
                                                                                field.onChange(newValue.title);
                                                                                handleGetAllStatesByCountryId(newValue.id);
                                                                            } else {
                                                                                setStateData([]);
                                                                                setValue("country", null);
                                                                            }
                                                                        }}
                                                                        error={errors?.country}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="state"
                                                                control={control}
                                                                rules={{
                                                                    required: "State is required"
                                                                }}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        disabled={stateData?.length === 0}
                                                                        options={stateData}
                                                                        label={"State"}
                                                                        placeholder="Select state"
                                                                        value={stateData?.filter((row) => row.title === watch("state"))?.[0]?.id || null}
                                                                        onChange={(_, newValue) => {
                                                                            if (newValue?.id) {
                                                                                field.onChange(newValue.title);
                                                                            } else {
                                                                                setValue("state", null);
                                                                            }
                                                                        }}
                                                                        error={errors?.state}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-8 gap-4'>
                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="city"
                                                                control={control}
                                                                rules={{
                                                                    required: "City is required",
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="City"
                                                                        type={`text`}
                                                                        error={errors.city}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="zipCode"
                                                                control={control}
                                                                rules={{
                                                                    required: "Zip code is required",
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Zip code"
                                                                        type={`text`}
                                                                        error={errors.zipCode}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-1'>
                                                        <Controller
                                                            name="address1"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    label="Address 1"
                                                                    type={`text`}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className='grid grid-cols-1'>
                                                        <Controller
                                                            name="address2"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    label="Address 2"
                                                                    type={`text`}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className='grid grid-cols-8 gap-4'>
                                                        <div className='col-span-5'>
                                                            <Controller
                                                                name="email"
                                                                control={control}
                                                                rules={{
                                                                    required: "Email is required",
                                                                    pattern: {
                                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                        message: "Invalid email address",
                                                                    },
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Email"
                                                                        type="email"
                                                                        placeholder="Enter your email"
                                                                        error={errors.email}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-3'>
                                                            <DatePickerComponent setValue={setValue} control={control} name='birthDate' label={`Birth Date`} minDate={null} maxDate={(() => {
                                                                const today = new Date();
                                                                return `${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getDate().toString().padStart(2, "0")}/${today.getFullYear()}`;
                                                            })()} />
                                                            {/* <Controller
                                                    name="birthDate"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Birth date"
                                                            type={`date`}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                            }}
                                                        />
                                                    )}
                                                /> */}
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-1'>
                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="phone"
                                                                control={control}
                                                                rules={{
                                                                    required: "Phone is required",
                                                                    maxLength: {
                                                                        value: 10,
                                                                        message: 'Enter valid phone number',
                                                                    },
                                                                    minLength: {
                                                                        value: 10,
                                                                        message: 'Enter valid phone number',
                                                                    },
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Phone Number"
                                                                        type={`text`}
                                                                        error={errors.phone}
                                                                        onChange={(e) => {
                                                                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                            field.onChange(numericValue);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='grid grid-cols-12 gap-4'>
                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="emergencyContact"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Emergency contact"
                                                                        type={`text`}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="contactPhone"
                                                                control={control}
                                                                rules={{
                                                                    maxLength: {
                                                                        value: 10,
                                                                        message: 'Enter valid phone number',
                                                                    },
                                                                    minLength: {
                                                                        value: 10,
                                                                        message: 'Enter valid phone number',
                                                                    },
                                                                }}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Contact phone"
                                                                        type={`text`}
                                                                        error={errors.contactPhone}
                                                                        onChange={(e) => {
                                                                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                            field.onChange(numericValue);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className='col-span-4'>
                                                            <Controller
                                                                name="relationship"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        {...field}
                                                                        label="Relationship"
                                                                        type={`text`}
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeStep === 2 && (
                                            <>
                                                <div className='mb-5 font-medium text-center text-[28px] text-[#262B43]'>
                                                    <p style={{ color: theme.palette.primary.text.main, }}>User Pin</p>
                                                </div>
                                                <div className='grid grid-row gap-3'>
                                                    <div className='grid grid-cols-1 relative'>
                                                        <Controller
                                                            name="password"
                                                            control={control}
                                                            rules={{
                                                                required: "Pin is required",
                                                                // validate: (value) => {
                                                                //     if (value.length < 8) {
                                                                //         return "Password must be at least 8 characters";
                                                                //     }
                                                                // }
                                                            }}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    label="Pin"
                                                                    type={`${isPasswordVisible ? 'text' : 'password'}`}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                        validatePassword(e.target.value)
                                                                    }}
                                                                    // onFocus={(e) => {
                                                                    //     setShowPasswordRequirement(true)
                                                                    // }}
                                                                    // onBlur={(e) => {
                                                                    //     setShowPasswordRequirement(false)
                                                                    // }}
                                                                    error={errors.password}
                                                                    // helperText={errors.password && errors.password.message}
                                                                    endIcon={
                                                                        <span
                                                                            onClick={togglePasswordVisibility}
                                                                            style={{ cursor: 'pointer', color: 'white' }}
                                                                        >
                                                                            {isPasswordVisible ? (
                                                                                <CustomIcons iconName={'fa-solid fa-eye'} css='cursor-pointer text-black' />
                                                                            ) : (
                                                                                <CustomIcons iconName={'fa-solid fa-eye-slash'} css='cursor-pointer text-black' />
                                                                            )}
                                                                        </span>
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                        {/* {
                                                            showPasswordRequirement && (
                                                                <div className='absolute border-gray-300 border-2 bg-gray-100 z-50 w-96 rounded-md p-2 
                   transition-all duration-300 transform translate-y-12 opacity-100'>
                                                                    {passwordError.map((error, index) => (
                                                                        <div key={index} className="flex items-center">
                                                                            <p className="grow text-black text-sm">{error.message}</p>
                                                                            <p>
                                                                                {error.showError ? (
                                                                                    <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-red-600' />
                                                                                ) : (
                                                                                    <CustomIcons iconName={'fa-solid fa-check'} css='cursor-pointer text-green-600' />
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )
                                                        } */}
                                                    </div>

                                                    <div className='grid grid-cols-1'>
                                                        <Controller
                                                            name="confirmPassword"
                                                            control={control}
                                                            rules={{
                                                                required: "Confirm pin is required",
                                                                validate: (value) => {
                                                                    if (value !== watch('password')) {
                                                                        return "Confirm passwords do not match to password";
                                                                    }
                                                                }
                                                            }}
                                                            render={({ field }) => (
                                                                <Input
                                                                    {...field}
                                                                    label="Confirm Pin"
                                                                    type={`${isConfirmPasswordVisible ? 'text' : 'password'}`}
                                                                    onChange={(e) => {
                                                                        field.onChange(e);
                                                                    }}
                                                                    error={errors.confirmPassword}
                                                                    // helperText={errors.confirmPassword && errors.confirmPassword.message}
                                                                    endIcon={
                                                                        <span
                                                                            onClick={toggleConfirmPasswordVisibility}
                                                                            style={{ cursor: 'pointer', color: 'white' }}
                                                                        >
                                                                            {isConfirmPasswordVisible ? (
                                                                                <CustomIcons iconName={'fa-solid fa-eye'} css='cursor-pointer text-black' />
                                                                            ) : (
                                                                                <CustomIcons iconName={'fa-solid fa-eye-slash'} css='cursor-pointer text-black' />
                                                                            )}
                                                                        </span>
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className='flex justify-end gap-4 mt-3'>
                                            <div>
                                                <Button type={'button'} onClick={handleBack} text={"Back"} />
                                            </div>
                                            <div>
                                                <Button type={'submit'} text={activeStep === steps?.length - 1 ? "Submit" : "Next"} isLoading={loading} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            ) :
                <React.Fragment>
                    {/* <div className='md:flex justify-center items-center gap-4'>
                        <PermissionWrapper
                            functionalityName="Users"
                            moduleName="User"
                            actionId={1}
                            component={
                                <div className="h-[72px] p-4 flex justify-between items-center gap-6 bg-white rounded-lg mb-4 md:mb-0">
                                    <div className='bg-secondary_light rounded-full h-10 w-10 flex items-center justify-center'>
                                        <Icons.RiUserAddLine />
                                    </div>
                                    <div className='xl:text-lg font-medium text-textColor capitalize'>
                                        Add new user
                                    </div>
                                    <div>
                                        <Button text="Add" type="button" onClick={() => handleAddUser()} />
                                    </div>
                                </div>

                            }
                        />

                        <div className="h-[72px] p-4 flex justify-between items-center gap-6 bg-white rounded-lg">
                            <div className='bg-secondary_light rounded-full h-10 w-10 flex items-center justify-center'>
                                <Icons.RiFileList3Line />
                            </div>

                            <div className='xl:text-lg font-medium text-textColor capitalize'>
                                Add new contractor
                            </div>                            
                        </div>
                    </div> */}

                    {/* <hr className="px-4 lg:px-0 h-px my-4 md:w-full bg-gray-300 border-0" />                 */}

                    <div className='border rounded-lg bg-white lg:w-full'>
                        <DataTable columns={columns} rows={rows} getRowId={getUsersId} height={450} showButtons={true} buttons={actionButtons} />
                    </div>
                </React.Fragment>
            }
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteUser} handleClose={handleCloseDialog} loading={loading} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(AddUser)