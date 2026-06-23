import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { ReactComponent as User } from "../../../assets/svgs/user-alt.svg";
import { getStaticRoles, getStaticRolesWithPermissions, indianOrganizationType, oganizationType, uploadFiles } from '../../../service/common/commonService';
import { deleteGeofence, getCurrentLocation } from '../../../service/common/radarService';
import { createCompanyDetails, getCompanyDetails, updateCompanyDetails, uploadCompanyLogo, deleteCompanyLogo, getLastCompanyDetails } from '../../../service/companyDetails/companyDetailsService';
import { handleSetTitle, setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import Input from '../../common/input/input';
import Button from '../../common/buttons/button';
import Components from '../../muiComponents/components';

import Select from '../../common/select/select';
import { Tabs } from '../../common/tabs/tabs';
import CustomIcons from '../../common/icons/CustomIcons';
import AlertDialog from '../../common/alertDialog/alertDialog';
import AddLocationModel from '../../models/location/addLocationModel';
import { deleteLocation, getAllLocationsByCompanyId } from '../../../service/location/locationService';
import { useTheme } from '@mui/material';
import AddGeofences from '../../models/geofencesModel/addGeofences';

const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0].replace(/-/g, ""); // e.g. "20250407"
};

const requiredContactKeys = ['firstName', 'lastName', 'email', 'phone', 'userName', 'password', 'roleName', 'gender'];

const GenderOptions = [
    { id: 1, title: "Male" },
    { id: 2, title: "Female" }
]

const AddCompany = ({ setShowCompanyDetails, setAlert, setCompanyId, id, setAddCompany, handleGetCompanyDetails, selectedTabValue, setEditTab, handleGetSetectedCompanyDetails }) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const theme = useTheme();

    const [roleData, setRoleData] = useState(getStaticRoles());

    const [selectedRole, setSelectedRole] = useState(1)

    const [tabData, setTabData] = useState([
        {
            label: 'Company Details',
        },
        {
            label: 'Company Location',
        },
    ])

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [orgType, setOrgType] = useState([])
    const [formDataFile, setFormDataFile] = useState(null)
    const [selectedTab, setSelectedTab] = useState(0);
    const [contactRow, setContactRow] = useState([]);
    const [activeContact, setActiveContact] = useState(null);

    const [deletedContact, setDeletedContact] = useState([])

    const [companyId, setCurrentCompanyId] = useState(id);

    const [showGeofencesModel, setShowGeofencesModel] = useState(false)
    const [selectedGeofences, setSelectedGeofences] = useState(null)

    const [locationModal, setLocationModal] = useState(false)
    const [locationData, setLocationData] = useState([])
    const [editLocationId, setEditLocationId] = useState(null)
    const [locationId, setLocationId] = useState(null);
    const [dialogLocation, setDialogLocation] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogGeofence, setDialogGeofence] = useState({ open: false, title: '', message: '', actionButtonText: '' });

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
            dba: "",
            companyLogo: "",
            industryName: "",
            phone: "",
            email: "",
            websiteUrl: "",
            timeZone: "",
            timeZoneId: "",
            locationName: "",
            isActive: 1,
            zipCode: "",
            city: "",
            state: "",
            country: "",
            address1: "",
            address2: "",
            employeeCount: "",
            ein: "",
            organizationType: "",
            companyEmployeeDto: {
                userName: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                password: "",
                roleId: selectedRole,
                roleName: 'Admin',
                companyId: "",
                gender: "",
            }
        },
    });

    const handleOpenLocationModal = (id = null) => {
        if (id) {
            setEditLocationId(id);
        }
        setLocationModal(true)
    }

    const handleCloseLocationModal = () => {
        setLocationModal(false)
        setEditLocationId(null);
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const handleDeleteLocationDialog = (geofenceId, id, index) => {
        setLocationId({ id: id, rowIndex: index, geofenceId: geofenceId });
        setDialogLocation({
            open: true,
            title: 'Delete Location',
            message: 'Are you sure! Do you want to delete this location?',
            actionButtonText: 'Delete',
        })
    }

    const handleCloseLocationDialog = () => {
        setDialogLocation({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setLocationId(null);
    }

    const handleDeleteLocation = async () => {
        setLoading(true)
        if (locationId.id) {
            if (locationId?.geofenceId) {
                const res = await deleteGeofence(locationId?.geofenceId)
                if (res.meta?.code !== 200) {
                    setAlert({ open: true, message: "Failed to delete geofence.", type: 'error' });
                    setLoading(false)
                }
            }
            const response = await deleteLocation(locationId.id);
            if (response?.data?.status !== 200) {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false)
            } else {
                handleCloseLocationDialog()
                handleGetAllLocationsByCompanyId()
                setAlert({ open: true, message: response.data.message, type: 'success' });
                setLoading(false)
            }
        }
    }

    const handleCloseGeofencesDialog = () => {
        setDialogGeofence({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        })
    }

    const handleOpenGeofencesModel = (index, field) => {
        if (field?.id) {
            setDialogGeofence({
                open: false,
                title: '',
                message: '',
                actionButtonText: ''
            })
            setSelectedGeofences({ ...field, index: index })
            setShowGeofencesModel(true)
        } else {
            setDialogGeofence({
                open: true,
                title: 'Location Required',
                message: 'Please create and save the location first before adding geofences.',
                actionButtonText: 'Close'
            })
        }
    }

    const handleCloseGeofencesModel = () => {
        setSelectedGeofences(null)
        setShowGeofencesModel(false)
    }

    const handleAddContactRow = () => {
        if (selectedTab === 2) {
            const isValid = (value) => value !== undefined && value !== null && value !== "";

            const newContact = {
                firstName: watch("companyEmployeeDto.firstName"),
                lastName: watch("companyEmployeeDto.lastName"),
                email: watch("companyEmployeeDto.email"),
                phone: watch("companyEmployeeDto.phone"),
                userName: watch("companyEmployeeDto.userName"),
                password: watch("companyEmployeeDto.password"),
                roleName: watch("companyEmployeeDto.roleName"),
                roleId: selectedRole,
                companyId: companyId
            };

            const allValid = requiredContactKeys.every(field => isValid(watch(`companyEmployeeDto.${field}`)));
            if (allValid) {
                if (activeContact !== null) {
                    setContactRow((prev) => {
                        const updated = [...prev];
                        updated[activeContact] = newContact;
                        return updated;
                    });
                    setActiveContact(null);
                } else {
                    if (contactRow?.length > 0) {
                        setContactRow((prev) => [...prev, newContact]);
                    } else {
                        setContactRow([newContact]);
                    }
                }
                const resetFields = ['firstName', 'lastName', 'email', 'phone', 'userName', 'password', 'roleName', 'roleId', 'gender'];
                resetFields.forEach(field => setValue(`companyEmployeeDto.${field}`, `companyEmployeeDto.${field}` === "roleId" ? null : ""));
                setSelectedRole(null)
            } else {
                if (contactRow?.length > 0) {
                    return
                } else {
                    setAlert({ open: true, message: "All fields are required", type: 'warning' });
                }
            }
        }
    }

    const handleUpdateContactRow = (index, row) => {
        requiredContactKeys.forEach((item) => {
            setValue(`companyEmployeeDto.${item}`, row[item]);
        });
        setSelectedRole(row.roleId);
        setActiveContact(index);
    };

    const handleDeleteContactRow = (index, contactId) => {
        setContactRow((prev) => {
            const newRow = [...prev];
            newRow.splice(index, 1);
            return newRow;
        });
        if (contactId !== undefined) {
            setDeletedContact((prev) => [...prev, contactId])
        }
    }

    const resetContact = () => {
        const resetFields = ['firstName', 'lastName', 'email', 'phone', 'userName', 'password', 'roleName', 'roleId', 'gender'];
        resetFields.forEach(field => setValue(`companyEmployeeDto.${field}`, `companyEmployeeDto.${field}` === "roleId" ? null : ""));
        setSelectedRole(null)
    }

    const handleBack = () => {
        handleGetSetectedCompanyDetails(companyId)
        // setCompanyId(null)
        if (userInfo?.companyId && userInfo?.employeeId) {
            handleGetCompanyDetails()
        }
        setAddCompany(false)
        setSelectedTab(0)
        reset({});
        setShowCompanyDetails(true)
    };

    const handleChangeTab = (value) => {
        if (selectedTab === value) {
            return;
        } else if (value > selectedTab) {
            document.getElementById("submitBtn").click();
            return
        } else if (value < selectedTab) {
            setSelectedTab(value);
        }
    }

    // const handleSetTimeZoneData = () => {
    //     if (timeZones && watch("locations")?.length > 0) {
    //         const data = watch("locations")?.map((location) => {
    //             const filteredTimeZone = timeZones?.filter((item) => item.zone === location?.timeZone);
    //             return {
    //                 ...location,
    //                 timeZoneId: filteredTimeZone[0]?.id,
    //             }
    //         });
    //         setValue("locations", data);
    //     }
    // }

    const handleGetCompany = async () => {
        setLocationData([]);
        if (id) {
            setSelectedTab(selectedTabValue)
            setTabData([
                {
                    label: 'Company Details',

                },
                {
                    label: 'Company Location',
                },
            ])
            // handleFetchAllTimeZones();
            const response = await getCompanyDetails(id);
            if (response.data.status === 200) {
                reset(response.data.result);
                setLocationData(response.data?.result?.locations);
            } else {
                setAlert({ message: response.data.message, type: 'error' });
            }
        } else {
            setSelectedTab(0)
            setTabData((prev) => {
                const exists = prev.some(tab => tab.label === 'Company Contact');
                if (exists) return prev;
                return [...prev, { label: 'Company Contact' }];
            });
            reset({
                companyNo: "",
                companyName: "",
                dba: "",
                companyLogo: "",
                industryName: "",
                phone: "",
                email: "",
                websiteUrl: "",
                timeZone: "",
                timeZoneId: "",
                isActive: 1,
                locationName: "",
                city: "",
                state: "",
                country: "",
                address1: "",
                address2: "",
                zipCode: "",
                employeeCount: "",
                companyEmployeeDto: {
                    userName: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    password: "",
                    roleId: '',
                    roleName: 'Admin',
                    companyId: "",
                }
            })
            // handleFetchAllTimeZones();
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
            setCurrentCompanyId(companyId)
            setSelectedTab((prev) => prev + 1)
            setLoading(false);
            if ((selectedTab === 2 && !id) || (selectedTab === 1 && companyId && id)) {
                handleGetCompanyDetails()
                setCompanyId(companyId)
                handleGetSetectedCompanyDetails(companyId)
                setAddCompany(false)
                setEditTab(0)
                setCurrentCompanyId(null)
            }
        } else {
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
                        } else {
                            setFormDataFile(null)
                            setLoading(false);
                            setCurrentCompanyId(companyId)
                            setSelectedTab((prev) => prev + 1)
                            if ((selectedTab === 2 && !companyId) || (selectedTab === 1 && companyId)) {
                                handleGetCompanyDetails()
                                setCompanyId(companyId)
                                handleGetSetectedCompanyDetails(companyId)
                                setAddCompany(false)
                                setEditTab(0)
                                setCurrentCompanyId(null)
                            }
                        }
                    })
                } else {
                    setAlert({ open: true, message: res?.data?.message, type: "error" })
                    setLoading(false)
                }
            });
        }
    }

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    const handleDeleteImage = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (companyId && formDataFile === null) {
            const response = await deleteCompanyLogo(companyId);
            if (response.data.status === 200) {
                setValue("companyLogo", "");
                setFormDataFile(null);
            } else {
                setAlert({ open: true, message: response.data.message, type: "error" })
            }
        } else {
            setValue("companyLogo", "");
            setFormDataFile(null);
        }
    }

    const getAllNewContact = () => {
        const isValid = (value) => value !== undefined && value !== null && value !== "";
        let contact = []
        setContactRow((prev) => {
            if (prev) {
                const allValid = requiredContactKeys.every(field => isValid(prev[field]));            
                if (allValid) {
                    contact = [...prev];
                }
            }
        })
        const allValid = requiredContactKeys.every(field => isValid(watch(`companyEmployeeDto.${field}`)));
        if (allValid) {
            const newContact = {
                firstName: watch("companyEmployeeDto.firstName"),
                lastName: watch("companyEmployeeDto.lastName"),
                email: watch("companyEmployeeDto.email"),
                phone: watch("companyEmployeeDto.phone"),
                userName: watch("companyEmployeeDto.userName"),
                password: watch("companyEmployeeDto.password"),
                roleName: watch("companyEmployeeDto.roleName"),
                gender: parseInt(watch("companyEmployeeDto.gender")) === 1 ? "Male" : "Female",
            }
            contact.push(newContact);
        }
        return contact;
    }

    const submit = async (data) => {
        if (selectedTab === 1 && locationData?.length === 0) {
            setAlert({ open: true, message: "Please add at least one location", type: 'warning' });
            return;
        }

        const filteredContact = getAllNewContact()

        const filterRoles = getStaticRolesWithPermissions()

        if (filteredContact.length === 0 && selectedTab === 2) {
            setAlert({ open: true, message: "Please add at least one contact", type: 'warning' });
            return;
        }

        const filteredData = {
            ...data,
            roles: filterRoles,
            employees: filteredContact,
            deletedEmployeeId: (deletedContact?.length > 0 && deletedContact !== null) ? deletedContact : [],
            organizationType: oganizationType?.find(item => item.id === data.organizationType)?.title || "",
        }

        if (companyId) {
            setLoading(true)
            const response = await updateCompanyDetails(companyId, filteredData, selectedTab + 1);
            if (response?.data?.status === 200) {
                handleUploadImage(companyId)
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        } else {
            setLoading(true)
            const response = await createCompanyDetails(filteredData, selectedTab + 1);
            if (response?.data?.status === 201) {
                handleUploadImage(response?.data?.result?.id)
            } else {
                setAlert({ open: true, message: response.data.message, type: 'error' });
                setLoading(false);
            }
        }
    }

    // const handleFetchAllTimeZones = async () => {
    //     const response = await fetchAllTimeZones()
    //     setTimeZones(response)
    // }

    const handleGetLastCompanyDetails = async () => {
        if (id) {
            return;
        }
        const response = await getLastCompanyDetails();

        if (response?.data?.status === 200) {
            const companyNo = response.data.result; // directly assign

            const today = getCurrentDate();
            let newSerial = "01"; // default

            if (companyNo && companyNo.startsWith(today)) {
                const lastSerial = parseInt(companyNo.slice(-2));
                newSerial = String(lastSerial + 1).padStart(2, "0");
            }

            const generatedCompanyNo = `${today}${newSerial}`;
            setValue("companyNo", generatedCompanyNo);
        } else {
            // fallback if no previous company or API error
            const today = getCurrentDate();
            const generatedCompanyNo = `${today}01`;
            setValue("companyNo", generatedCompanyNo);
        }
    };

    const handleGetCurrentLocation = async () => {
        const res = await getCurrentLocation()
        if (res?.address?.countryCode === "IN" && res?.address?.country?.toLowerCase() === "india") {
            setOrgType(indianOrganizationType)
        } else {
            setOrgType(oganizationType)
        }
    }

    const handleGetAllLocationsByCompanyId = async () => {
        const response = await getAllLocationsByCompanyId(companyId);
        if (response?.data?.status === 200) {
            setLocationData(response?.data?.result || []);
        }
    }

    useEffect(() => {
        handleGetCurrentLocation()
    }, [])

    useEffect(() => {
        handleGetLastCompanyDetails()
    }, [id])

    useEffect(() => {
        handleGetCompany();
    }, [id])

    // useEffect(() => {
    //     handleSetTimeZoneData()
    // }, [timeZones])

    return (
        <div className='py-2 px-4 lg:px-8 border rounded-lg bg-white relative'>
            <form onSubmit={handleSubmit(submit)} className='mt-4'>
                <div className='my-3 md:ml-20'>
                    <Tabs tabsData={tabData} selectedTab={selectedTab} handleChange={handleChangeTab} type='underline' />
                </div>
                {
                    selectedTab === 0 && (
                        <div className='mt-8'>
                            <div className="flex items-center justify-center">
                                <div
                                    className="w-28 h-28 lg:h-32 lg:w-32 border rounded-full flex items-center justify-center  cursor-pointer relative"
                                    onClick={handleDivClick}
                                >
                                    {watch("companyLogo") ? (
                                        <img
                                            src={watch("companyLogo")}
                                            alt="Preview"
                                            className="h-full w-full object-cover rounded-full border"
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center h-full w-full">
                                            <User height={70} width={70} fill="#CED4DA" />
                                        </div>
                                    )}
                                    {watch("companyLogo") && (
                                        <div className='absolute -top-2 right-0 h-6 w-6 flex justify-center items-center rounded-full border border-red-500 bg-red-500'>
                                            <div onClick={(e) => handleDeleteImage(e)}>
                                                <CustomIcons iconName={'fa-solid fa-xmark'} css='cursor-pointer text-white' />
                                            </div>
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

                            <div className='w-full mt-5'>
                                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                    <div>
                                        <Controller
                                            name="companyNo"
                                            control={control}
                                            rules={{
                                                required: "Company number is required",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Company ID"
                                                    type={`text`}
                                                    disabled={true}
                                                    error={errors.companyNo}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
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
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name="ein"
                                            control={control}
                                            rules={{
                                                validate: (value) => {
                                                    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                                                    return gstPattern.test(value) || "(e.g., 27ABCDE1234F1Z5)";
                                                },
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="GST Number"
                                                    type="text"
                                                    onChange={(e) => {
                                                        // Clean the input to match IFSC code format
                                                        if (e.target.value) {
                                                            const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                                            field.onChange(cleaned);
                                                        } else {
                                                            field.onChange("");
                                                        }
                                                    }}
                                                    error={errors?.ein}
                                                    helperText={errors?.ein ? errors.ein.message : ""}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name="dba"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="DBA"
                                                    type={`text`}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name={`organizationType`}
                                            control={control}
                                            rules={{
                                                required: "Organization Type is required"
                                            }}
                                            render={({ field }) => (
                                                <Select
                                                    options={orgType}
                                                    label="Organization Type"
                                                    placeholder="Select organization type"
                                                    error={errors?.organizationType}
                                                    value={parseInt(watch("organizationType")) || null}
                                                    onChange={(_, newValue) => {
                                                        if (newValue) {
                                                            field.onChange(newValue.id);
                                                        } else {
                                                            setValue("organizationType", null);
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name="industryName"
                                            control={control}
                                            rules={{
                                                required: "Industry Name is required",
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Industry Name"
                                                    type={`text`}
                                                    error={errors.industryName}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
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
                                                    type={`text`}
                                                    error={errors?.email}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div>
                                        <Controller
                                            name="phone"
                                            control={control}
                                            rules={{
                                                required: "Company phone is required",
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
                                                    error={errors?.phone}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    <div className='col-span-2'>
                                        <Controller
                                            name="websiteUrl"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Website Url"
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
                        </div>
                    )
                }
                {
                    selectedTab === 1 && (
                        <>
                            <div className='pt-10 md:pt-5'>
                                <div className='overflow-x-auto'>
                                    <div class="flex justify-end items-center rounded-full mb-3">
                                        <div
                                            onClick={() => handleOpenLocationModal()}
                                            class="p-2 cursor-pointer rounded-full text-white flex justify-center items-center h-10 w-10" aria-label="Add Location"
                                            style={{ backgroundColor: theme.palette.primary.main }}>
                                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer' />
                                        </div>
                                    </div>
                                    <table className="min-w-full border-collapse border border-gray-400 h-full">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    #
                                                </th>
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    Location Name
                                                </th>
                                                {/* <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    TimeZone
                                                </th> */}
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    City
                                                </th>
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    State
                                                </th>
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    Country
                                                </th>
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    Zip Code
                                                </th>
                                                <th className="border border-gray-400 px-5 text-sm bg-gray-200 py-2">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        {
                                            locationData?.length > 0 ? (
                                                <tbody>
                                                    {locationData?.map((field, index) => (
                                                        <tr key={index} className="text-center">
                                                            <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {index + 1}
                                                            </td>
                                                            <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {field?.locationName}
                                                            </td>
                                                            {/* <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {field?.timeZone}
                                                            </td> */}
                                                            <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {field?.city}
                                                            </td>
                                                            <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {field?.state}
                                                            </td>
                                                            <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {field?.country}
                                                            </td>
                                                            <td className="border border-gray-400 p-2 text-center font-bold text-xs lg:text-sm">
                                                                {field?.zipCode}
                                                            </td>
                                                            <td className="border border-gray-400 px-2 text-center font-bold text-sm">
                                                                <div className="flex justify-center items-center gap-2">
                                                                    <div className="h-6 w-6 md:h-8 md:w-8 flex justify-center items-center bg-green-600 cursor-pointer rounded-full text-white"
                                                                        onClick={() => handleOpenGeofencesModel(index, field)}>
                                                                        <CustomIcons iconName={'fa-solid fa-location-dot'} css='cursor-pointer' />
                                                                    </div>
                                                                    <div className="h-6 w-6 md:h-8 md:w-8 flex justify-center items-center bg-blue-600 cursor-pointer rounded-full text-white"
                                                                        onClick={() => handleOpenLocationModal(field.id)}>
                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer' />
                                                                    </div>
                                                                    <div className="h-6 w-6 md:h-8 md:w-8 flex justify-center items-center bg-red-600 cursor-pointer rounded-full text-white"
                                                                        onClick={() => handleDeleteLocationDialog(field?.geofenceId, field?.id, index)}
                                                                    >
                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer' />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            ) : (
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={9} className="border border-gray-400 p-2 text-center">
                                                            No locations added yet.
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            )}
                                    </table>
                                </div>

                            </div>
                        </>
                    )
                }
                {
                    (!id && selectedTab === 2) && (
                        <div className='pt-5'>
                            <div className='grid grid-cols-4 gap-3'>
                                <div>
                                    <Controller
                                        name="companyEmployeeDto.firstName"
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "First name is required" : false,
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="First Name"
                                                type={`text`}
                                                error={errors.companyEmployeeDto?.firstName}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="companyEmployeeDto.lastName"
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "Last name is required" : false,
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Last Name"
                                                type={`text`}
                                                error={errors.companyEmployeeDto?.lastName}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="companyEmployeeDto.email"
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "Email is required" : false,
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Email"
                                                type={`text`}
                                                error={errors.companyEmployeeDto?.email}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="companyEmployeeDto.phone"
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "Phone is required" : false,
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
                                                error={errors.companyEmployeeDto?.phone}
                                                onChange={(e) => {
                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                    field.onChange(numericValue);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="companyEmployeeDto.gender"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                options={GenderOptions}
                                                label={"Gender"}
                                                placeholder="Select Gender"
                                                value={parseInt(watch("companyEmployeeDto.gender")) || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue?.id) {
                                                        field.onChange(newValue.id);
                                                    } else {
                                                        setValue("companyEmployeeDto.gender", null);
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <Controller
                                        name="companyEmployeeDto.userName"
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "Username is required" : false,
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="User Name"
                                                type={`text`}
                                                error={errors.companyEmployeeDto?.userName}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div className='relative'>
                                    <Controller
                                        name="companyEmployeeDto.password"
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "Pin is required" : false,
                                            // pattern: {
                                            //     value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
                                            //     message: "Password must contain Min 8 chars with 1 uppercase, 1 lowercase, 1 number & 1 special char",
                                            // },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                label="Pin"
                                                type={`${isPasswordVisible ? 'text' : 'password'}`}
                                                error={errors.companyEmployeeDto?.password}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    // validatePassword(e.target.value)
                                                }}
                                                // onFocus={(e) => {
                                                //     setShowPasswordRequirement(true)
                                                // }}
                                                // onBlur={(e) => {
                                                //     setShowPasswordRequirement(false)
                                                // }}
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
                                </div>

                                <div className='w-full'>
                                    <Controller
                                        name={`companyEmployeeDto.roleName`}
                                        control={control}
                                        rules={{
                                            required: contactRow?.length === 0 ? "Role is required" : false
                                        }}
                                        render={({ field }) => (
                                            <Select
                                                options={roleData}
                                                label="Employe Role"
                                                placeholder="Select role"
                                                multiple={false}
                                                error={errors?.companyEmployeeDto?.roleName}
                                                value={selectedRole || null}
                                                onChange={(_, newValue) => {
                                                    if (newValue && newValue.id) {
                                                        setSelectedRole(newValue.id)
                                                        setValue(`companyEmployeeDto.roleName`, newValue.title);
                                                    } else {
                                                        field.onChange(null);
                                                        setSelectedRole(null)
                                                        setValue(`companyEmployeeDto.roleName`, "");
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex justify-start items-center gap-2">
                                    <div className="h-8 w-8 flex justify-center items-center bg-green-600 cursor-pointer rounded-full text-white"
                                        onClick={() => handleAddContactRow()}>
                                        <CustomIcons iconName={'fa-solid fa-floppy-disk'} css='cursor-pointer text-white' />
                                    </div>
                                    <div className="h-8 w-8 flex justify-center items-center bg-gray-600 cursor-pointer rounded-full text-white"
                                        onClick={() => resetContact()}>
                                        <CustomIcons iconName={'fa-solid fa-arrows-rotate'} css='cursor-pointer' />
                                    </div>
                                </div>
                            </div>

                            {
                                contactRow?.length > 0 && (
                                    <div className='mt-3'>
                                        <table className="min-w-full border-collapse border border-gray-300 h-full">
                                            <thead>
                                                <tr>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        #
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        First Name
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        Last Name
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        User Name
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        Email
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        Role
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        Phone
                                                    </th>
                                                    <th className="border border-gray-300 lg:px-5 text-xs lg:text-sm bg-gray-200 py-2">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contactRow?.map((field, index) => (
                                                    <tr key={index} className="text-center">
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {index + 1}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {field?.firstName}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {field?.lastName}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {field?.userName}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {field?.email}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {field?.roleName}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:p-2 text-center font-bold text-xs lg:text-sm">
                                                            {field?.phone}
                                                        </td>
                                                        <td className="border border-gray-300 p-1 lg:px-2 text-center font-bold text-sm">
                                                            <div className="flex justify-center items-center gap-2">
                                                                <div className="h-8 w-8 flex justify-center items-center bg-blue-600 cursor-pointer rounded-full text-white"
                                                                    onClick={() => handleUpdateContactRow(index, field)}>
                                                                    <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer' />
                                                                </div>
                                                                <div className="h-8 w-8 flex justify-center items-center bg-red-600 cursor-pointer rounded-full text-white"
                                                                    onClick={() => handleDeleteContactRow(index, field.id)}>
                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer' />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                <div className='flex justify-end mt-3 gap-3'>
                    <div>
                        <Button useFor='disabled' type={'button'} text={"Back"} disabled={selectedTab === 0} onClick={() => setSelectedTab((prev) => prev - 1)} />
                    </div>
                    <div>
                        <Button id="submitBtn" type={'submit'} text={((selectedTab === 2 && !id) || (id && selectedTab === 1)) ? "Submit" : "Next"} isLoading={loading} />
                    </div>
                </div>

            </form>

            <div className={`absolute border rounded-full ${(id || selectedTab === 1) ? "top-16" : "top-24"} md:top-5`}>
                <Components.IconButton onClick={handleBack}>
                    <CustomIcons iconName={'fa-solid fa-arrow-left'} css=' cursor-pointer h-5 w-5' />
                </Components.IconButton>
            </div>

            <AlertDialog open={dialogLocation.open} title={dialogLocation.title} message={dialogLocation.message} actionButtonText={dialogLocation.actionButtonText} handleAction={handleDeleteLocation} handleClose={handleCloseLocationDialog} loading={loading} />
            <AddLocationModel open={locationModal} handleClose={handleCloseLocationModal} locationId={editLocationId} companyId={companyId} handleGetLocations={handleGetAllLocationsByCompanyId} />

            <AddGeofences open={showGeofencesModel} handleClose={handleCloseGeofencesModel} selectedLocationRow={selectedGeofences} companyId={companyId} handleGetLocations={handleGetAllLocationsByCompanyId} />

            <AlertDialog open={dialogGeofence.open} title={dialogGeofence.title} message={dialogGeofence.message} actionButtonText={dialogGeofence.actionButtonText} handleAction={handleCloseGeofencesDialog} handleClose={handleCloseGeofencesDialog} loading={loading} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle
};

export default connect(null, mapDispatchToProps)(AddCompany)