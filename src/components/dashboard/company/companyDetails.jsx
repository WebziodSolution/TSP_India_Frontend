import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import { ReactComponent as User } from "../../../assets/svgs/user-alt.svg";

import { handleSetCompanyLogo, handleSetTitle, setAlert } from '../../../redux/commonReducers/commonReducers';
import AlertDialog from '../../common/alertDialog/alertDialog';
import { deleteCompanyDetails, deleteCompanyLogo, getAllCompanyDetails, getCompanyDetails, searchCompany, updateCompanyDetails, uploadCompanyLogo } from '../../../service/companyDetails/companyDetailsService';
import SearchInput from '../../common/input/searchInput/searchInput';
import AddCompany from './addCompany';
import { Tabs } from '../../common/tabs/tabs';
import { deleteEmployee, getAllCompanyEmployee } from '../../../service/companyEmployee/companyEmployeeService';
import AddEmployee from './employee/addEmployee';
import CustomIcons from '../../common/icons/CustomIcons';
import PermissionWrapper from '../../common/permissionWrapper/PermissionWrapper';
import Components from '../../muiComponents/components';
import { Tooltip, useTheme } from '@mui/material';
import { indianOrganizationType, oganizationType, uploadFiles } from '../../../service/common/commonService';
import { deleteGeofence, getCurrentLocation } from '../../../service/common/radarService';
import { deleteLocation, getAllLocationsByCompanyId } from '../../../service/location/locationService';
import Button from '../../common/buttons/button';
import Menu from '../../common/menu/Menu';
import CompanyTheme from '../settings/companyTheme/companyTheme';
import AddGeofences from '../../models/geofencesModel/addGeofences';

import AddLocationModel from '../../models/location/addLocationModel';

let tabData = [
    {
        label: 'Company Details',
    },
    {
        label: 'Company Location'
    },
]

const ITEM_HEIGHT = 48;

const options = [
    {
        id: 1,
        name: "Active"
    },
    {
        id: 0,
        name: "Deactive"
    },
    {
        id: 2,
        name: "All"
    }
];

const CompanyDetails = ({ setAlert, handleSetTitle, handleSetCompanyLogo }) => {
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [formDataFile, setFormDataFile] = useState(null)
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogEmployee, setDialogEmployee] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogLocation, setDialogLocation] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [dialogGeofence, setDialogGeofence] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [orgType, setOrgType] = useState([])
    const [companyId, setCompanyId] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [locationId, setLocationId] = useState(null);
    const [editLocationId, setEditLocationId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [companyDetails, setCompanyDetails] = useState([]);
    const [search, setSearch] = useState('');
    const [searchError, setSearchError] = useState({ show: false, message: '' });
    const [addcompany, setAddCompany] = useState(false);
    const [addEmployee, setAddEmployee] = useState(false);
    const [selectdCompanyDetails, setSelectedCompanyDetails] = useState();
    const [selectedTab, setSelectedTab] = useState(0);
    const [employees, setEmployees] = useState([])
    const [editTab, setEditTab] = useState(0)
    const [inputData, setInputData] = useState([]);
    const [isEditingAll, setIsEditingAll] = useState(false);
    const [filterValue, setFilterValue] = useState(1)

    const [showCompanyDetails, setShowCompanyDetails] = useState(false)
    const [currentWindowWidth, setCurrentWindowWidth] = useState(window.innerWidth)

    const [showGeofencesModel, setShowGeofencesModel] = useState(false)
    const [selectedGeofences, setSelectedGeofences] = useState(null)

    const [locationModal, setLocationModal] = useState(false)
    const [locationData, setLocationData] = useState([])

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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (id) => {
        setFilterValue(id)
        setAnchorEl(null);
    };

    const submit = async () => {
        if (companyId) {
            const hasError = inputData?.some(item => item.error)

            if (hasError) {
                return
            }
            const dataToSubmit = { ...selectdCompanyDetails };
            inputData.forEach(item => {
                dataToSubmit[item.name] = item.value;
            });

            const response = await updateCompanyDetails(companyId, dataToSubmit, (inputData && selectedTab === 0) ? 1 : 2);
            if (response?.data?.status !== 200) {
                setAlert({ open: true, message: response.data.message, type: 'error' });
            } else {
                handleGetCompany(companyId)
                setAlert({ open: true, message: response.data.message, type: 'success' });
                setInputData([]);
                setIsEditingAll(false);
            }
        }
    }

    const CustomText = (text, value, name) => {
        const handleChange = (e, currentName) => {
            const newValue = e.target.value;

            const data = {
                ...selectdCompanyDetails,
                [currentName]: newValue,
            };
            setSelectedCompanyDetails(data);

            setInputData(prev => prev.map(item => {
                if (item.name === currentName) {
                    let error = false;
                    let errorMessage = "";

                    if (!newValue) {
                        error = true;
                        errorMessage = `${currentName === "ein" ? "GST Number" : currentName} is required`;
                    }

                    if (currentName === "phone" && newValue) {
                        if (newValue.length !== 10) {
                            error = true;
                            errorMessage = "Invalid phone number";
                        }
                    }

                    if (currentName === "email" && newValue) {
                        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                        if (!emailRegex.test(newValue)) {
                            error = true;
                            errorMessage = "Invalid email address";
                        }
                    }

                    if (currentName === "ein" && newValue) {
                        const sanitizedValue = newValue.trim().toUpperCase();
                        data[currentName] = sanitizedValue;

                        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

                        if (!gstRegex.test(sanitizedValue)) {
                            error = true;
                            errorMessage = "Invalid GST format. (e.g., 27ABCDE1234F1Z5)";
                        }
                    }


                    return { ...item, value: newValue, error, errorMessage };
                }
                return item;
            }));
        };

        const handleBlur = () => {
            // Check if any field has error before submitting
            const hasError = inputData.some(item => item.error);
            if (!hasError && !isEditingAll) {
                submit();
            }
        };

        const handleDoubleClick = () => {
            if (!isEditingAll) {
                setInputData([{ name, value, error: false, errorMessage: "" }]);
            }
        };

        const currentField = inputData.find(item => item.name === name) || {};

        return (
            <div className="flex">
                <span style={{ color: theme.palette.primary.text.main, }} className="grow md:grow-0 text-sm md:text-medium font-semibold min-w-[120px] lg:min-w-[140px]">{text}</span>

                {isEditingAll || currentField.name === name ? (
                    name === "organizationType" ? (
                        <select
                            style={{ color: theme.palette.primary.text.main }}
                            className={`border ${currentField?.error ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-gray-300"} text-black focus:outline-none w-52`}
                            value={currentField.value || selectdCompanyDetails[name] || ""}
                            onBlur={handleBlur}
                            onChange={(e) => handleChange(e, name)}
                        >
                            <option value="">Select Organization Type</option>
                            {orgType?.map((type) => (
                                <option key={type.id} value={type.title}>
                                    {type.title}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className='grid grid-rows-2 gap-1'>
                            <input
                                style={{ color: theme.palette.primary.text.main }}
                                className={`border ${currentField?.error ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-gray-300"} text-black focus:outline-none`}
                                type="text"
                                value={currentField.value || selectdCompanyDetails[name] || ""}
                                onBlur={handleBlur}
                                onChange={(e) => handleChange(e, name)}
                            />
                            <span>{currentField?.error && <span className="text-red-600">{currentField.errorMessage}</span>}</span>
                        </div>
                    )
                ) : (
                    <PermissionWrapper
                        functionalityName="Company"
                        moduleName="Manage Employees"
                        actionId={2}
                        component={
                            <Tooltip placement="bottom" arrow title="Double-click To Edit">
                                <span
                                    style={{ color: theme.palette.primary.text.main, }}
                                    className="cursor-pointer"
                                    onDoubleClick={handleDoubleClick}
                                >
                                    {value || "-"}
                                </span>
                            </Tooltip>
                        }
                        fallbackComponent={
                            <span
                                style={{ color: theme.palette.primary.text.main, }}
                            >
                                {value || "-"}
                            </span>
                        }
                    />
                )}
            </div>
        );
    };

    const handleChangeTab = (value) => {
        setSelectedTab(value);
        setAddEmployee(false);
        setIsEditingAll(false)
    }

    const handleGetCompany = async (id) => {
        setCompanyId(id);
        const response = await getCompanyDetails(id);
        if (response.data.status === 200) {
            const data = {
                ...response.data?.result,
                deletedLocationId: [],
                deletedEmployeeId: [],
                companyEmployeeDto: {}
            }
            setSelectedCompanyDetails(data);
        }
    };

    const handleShowDetails = (id) => {
        if (window.innerWidth <= 768) {
            setShowCompanyDetails(true)
        }
        setSelectedTab(0)
        setAddCompany(false);
        handleGetCompany(id);
    }

    const handleGetCompanyDetails = async () => {
        if (!userInfo?.companyId && !userInfo?.employeeId) {
            const response = await getAllCompanyDetails(filterValue);
            if (companyDetails?.length <= 0 && (companyId === null || companyId === '')) {
                handleGetCompany(response?.data?.result[0]?.id)
            }
            if (response?.data?.result?.length > 0) {
                setSearchError({ show: false, message: "" })
                setCompanyDetails(response?.data?.result)
            } else {
                setSearchError({ show: true, message: "No data found" })
            }
        } else {
            handleGetCompany(userInfo?.companyId ? userInfo?.companyId : companyId)
        }
    }

    const handleAddEmployee = (id = null) => {
        if (id) {
            setEmployeeId(id)
        }
        setAddEmployee(true)
    }

    const handleAddCompany = () => {
        setCompanyId(null);
        setShowCompanyDetails(false)
        setSelectedTab(0)
        setSelectedCompanyDetails(null)
        setAddCompany(true);
    }

    const handleEditAllCompanyDetails = () => {
        if (selectedTab === 0) {
            setIsEditingAll(true);
            setInputData([
                { name: "companyName", value: selectdCompanyDetails?.companyName, error: false, errorMessage: "" },
                { name: "dba", value: selectdCompanyDetails?.dba, error: false, errorMessage: "" },
                { name: "email", value: selectdCompanyDetails?.email, error: false, errorMessage: "" },
                { name: "phone", value: selectdCompanyDetails?.phone, error: false, errorMessage: "" },
                { name: "industryName", value: selectdCompanyDetails?.industryName, error: false, errorMessage: "" },
                { name: "websiteUrl", value: selectdCompanyDetails?.websiteUrl, error: false, errorMessage: "" },
                { name: "ein", value: selectdCompanyDetails?.ein, error: false, errorMessage: "" },
                { name: "organizationType", value: selectdCompanyDetails?.organizationType, error: false, errorMessage: "" },
            ]);
        }
    };

    const handleEditLocation = async (id) => {
        handleOpenLocationModal(id);
    }

    const handleAddNewLocation = () => {
        handleOpenLocationModal();
    };

    const handleDeleteCompanyDialog = (id) => {
        setCompanyId(id);
        setDialog({
            open: true,
            title: 'Deactive Company',
            message: 'Are you sure! Do you want to deactive this company?',
            actionButtonText: 'Yes',
        })
    }

    const handleDeleteCompany = async (id) => {
        setLoading(true);
        if (companyId) {
            const response = await deleteCompanyDetails(companyId);
            if (response?.data?.status === 200) {
                setLoading(false);
                handleCloseDialog()
                handleGetCompanyDetails();

            } else {
                setLoading(false);
                setAlert({
                    open: true,
                    message: response?.data?.message,
                    type: 'error',
                });
            }
        }
    }

    const handleDeleteLocationDialog = (geofenceId, id, index) => {
        setLocationId({ id: id, rowIndex: index, geofenceId: geofenceId });
        setDialogLocation({
            open: true,
            title: 'Delete Location',
            message: 'Are you sure! Do you want to delete this location?',
            actionButtonText: 'Delete',
        })
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
                // handleGetCompany(companyId)
                handleGetAllLocationsByCompanyId()
                setAlert({ open: true, message: response.data.message, type: 'success' });
                setLoading(false)
                handleCloseLocationDialog()
                setIsEditingAll(false);
            }
        } else {
            setSelectedCompanyDetails((prev) => {
                const newRow = { ...prev };
                newRow?.locations?.splice(locationId.rowIndex, 1);
                return newRow;
            });
            setLoading(false)
            handleCloseLocationDialog()
        }
    }

    const handleDeleteEmployeeDialog = (id) => {
        setEmployeeId(id);
        setDialogEmployee({
            open: true,
            title: 'Delete Employee',
            message: 'Are you sure! Do you want to delete this employee?',
            actionButtonText: 'Delete',
        })
    }

    const handleDeleteEmployee = async (id) => {
        setLoading(true);
        if (companyId) {
            const response = await deleteEmployee(employeeId);
            if (response?.data?.status === 200) {
                setLoading(false);
                // setAlert({
                //     open: true,
                //     message: response?.data?.message,
                //     type: 'success',
                // });
                handleCloseEmployeeDialog()
                handleGetAllEmployees();
            } else {
                setLoading(false);
                setAlert({
                    open: true,
                    message: response?.data?.message,
                    type: 'error',
                });
            }
        }
    }

    const handleCloseDialog = () => {
        setDialog({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setCompanyId(null);
        setSelectedCompanyDetails(null);
    }

    const handleCloseEmployeeDialog = () => {
        setDialogEmployee({
            open: false,
            title: '',
            message: '',
            actionButtonText: ''
        });
        setEmployeeId(null);
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

    const handleSearchCompany = async () => {
        if (search === '' || search === null) {
            handleGetCompanyDetails()
            setSearchError({ show: false, message: '' });
            return
        }
        else {
            const params = `name=${search}&active=${filterValue}`
            const response = await searchCompany(params);
            if (response?.data?.result?.length === 0) {
                setSearchError({ show: true, message: `No client found with '${search}'` });
            } else {
                setCompanyDetails(response?.data?.result)
            }
        }
    }

    const handleGetAllEmployees = async () => {
        if (selectedTab === 2 && companyId) {
            const response = await getAllCompanyEmployee(companyId, 0);
            if (response?.data?.status === 200) {
                setEmployees(response?.data?.result);
            }
        }
    }

    const handleGetCurrentLocation = async () => {
        const res = await getCurrentLocation()
        if (res?.address?.countryCode === "IN" && res?.address?.country?.toLowerCase() === "india") {
            setOrgType(indianOrganizationType)
        } else {
            setOrgType(oganizationType)
        }
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setFormDataFile(file)
            setSelectedCompanyDetails((prev) => {
                const newRow = { ...prev, companyLogo: URL.createObjectURL(file) };
                return newRow
            })
        }
    }

    const handleUploadImage = () => {
        if (!formDataFile) {
            setLoading(false);
            return
        } else {
            const formData = new FormData();
            formData.append("files", formDataFile);
            formData.append("folderName", "companyLogo");
            formData.append("userId", companyId);

            uploadFiles(formData).then((res) => {
                if (res.data.status === 200) {
                    const { imageURL } = res?.data?.result?.uploadedFiles?.[0];
                    uploadCompanyLogo({ companyLogo: imageURL, companyId: companyId }).then((response) => {
                        if (response.data.status !== 200) {
                            setAlert({ open: true, message: response?.data?.message, type: "error" })
                        } else {
                            handleSetCompanyLogo(response.data?.result)
                            setFormDataFile(null)
                            setLoading(false);
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
                setSelectedCompanyDetails((prev) => {
                    const newRow = { ...prev, companyLogo: "" };
                    return newRow
                })
                setFormDataFile(null);
                handleSetCompanyLogo(null)
            } else {
                setAlert({ open: true, message: response.data.message, type: "error" })
            }
        } else {
            setSelectedCompanyDetails((prev) => {
                const newRow = { ...prev, companyLogo: "" };
                return newRow
            })
            setFormDataFile(null);
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

    const handleGetAllLocationsByCompanyId = async () => {
        if (selectedTab === 1) {
            const response = await getAllLocationsByCompanyId(companyId);
            if (response?.data?.status === 200) {
                setLocationData(response.data.result);
            } else {
                setAlert({ open: true, message: response?.data?.message, type: "error" });
            }
        }
    }

    useEffect(() => {
        handleUploadImage()
    }, [formDataFile])

    useEffect(() => {
        handleGetCompanyDetails();
    }, [filterValue])

    useEffect(() => {
        document.title = "Manage Company - Calculate Salary";
        setSelectedCompanyDetails(null)
        handleSetTitle("Manage Company")
        handleGetCurrentLocation()
        if (!userInfo?.companyId) {
            tabData.push(
                {
                    label: 'Company Contact',
                },
            )
        }

        ((userInfo?.roleName === "Admin" || userInfo?.roleName === "Owner") && userInfo?.companyId) &&
            tabData?.push({
                label: 'Company Theme',
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        handleSearchCompany()
    }, [search])

    useEffect(() => {
        handleGetAllEmployees()
        handleGetAllLocationsByCompanyId()
    }, [selectedTab])

    useEffect(() => {
        window.addEventListener("resize", () => {
            setCurrentWindowWidth(window.innerWidth)
            if (window.innerWidth > 768) {
                setShowCompanyDetails(false)
            } else {
                setShowCompanyDetails(true)
            }
        });
    }, [window.innerWidth])

    return (
        <div className='px-3 lg:px-0'>
            <div className={`lg:flex justify-start`}>
                {

                    (!userInfo?.companyId && !userInfo?.employeeId) && (
                        <div className={`${(addcompany && !showCompanyDetails) ? "hidden" : (!showCompanyDetails && currentWindowWidth <= 768) ? "block" : currentWindowWidth > 768 ? "block" : "hidden"} lg:w-[20rem] bg-white rounded-lg border min-h-[570px] lg:h-[550px] relative lg:mr-4`}>
                            {/* Sticky Search Bar */}
                            <div className='px-3 my-2 border-b sticky top-0 bg-white z-[60] flex items-center'>
                                <SearchInput
                                    startIcon={<CustomIcons iconName={'fa-solid fa-magnifying-glass'} css='mr-3' />}
                                    placeholder="Search Clients...."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {/* <div>
                                    <Components.IconButton
                                        aria-controls={open ? 'long-menu' : undefined}
                                        aria-expanded={open ? 'true' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleClick}
                                        style={{ backgroundColor: theme.palette.primary.main }}
                                    >
                                        <CustomIcons iconName={'fa-solid fa-filter'} css={`text-[16px] text-white`} />
                                    </Components.IconButton>
                                    <Menu
                                        width={100}
                                        id="long-menu"
                                        MenuListProps={{
                                            'aria-labelledby': 'long-button',
                                        }}
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={() => handleClose(1)}
                                        slotProps={{
                                            paper: {
                                                style: {
                                                    maxHeight: ITEM_HEIGHT * 4.5,
                                                    width: '20ch',
                                                },
                                            },
                                        }}
                                    >
                                        {options?.map((option) => (
                                            <Components.MenuItem key={option?.id} selected={option.id === filterValue} onClick={() => handleClose(option.id)}>
                                                {option.name}
                                            </Components.MenuItem>
                                        ))}
                                    </Menu>
                                </div> */}
                            </div>

                            <div className='overflow-y-auto h-full'>
                                {
                                    searchError?.show ? (
                                        <div className="text-center my-20">
                                            <p className="text-red-500 text-lg">{searchError.message}</p>
                                        </div>
                                    ) : (
                                        companyDetails?.map((company, index) => (
                                            <div key={index} style={{ borderLeftColor: theme.palette.primary.main }} className={`p-2 border-b group relative ${companyId === company.id ? `border-l-4 bg-gray-100` : ''}`}>
                                                <div className="flex justify-between items-center gap-4">
                                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleShowDetails(company?.id)}>
                                                        <div className="h-10 w-10 border rounded-full overflow-hidden">
                                                            {
                                                                !company?.companyLogo ? (
                                                                    <p className="w-full h-full rounded-full flex justify-center items-center text-center text-xl bg-blue-500 capitalize text-white">
                                                                        {company?.companyName[0]}
                                                                    </p>
                                                                ) : (
                                                                    <img src={company?.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                                                                )
                                                            }
                                                        </div>
                                                        <span className="font-semibold truncate">{company?.companyName}</span>
                                                    </div>

                                                    {/* <div className='p-2 bg-blue-100 rounded-full' onClick={() => handleEditCompany(company?.id)}>
                                                    <Icons.RiPencilLine className="text-blue-600 cursor-pointer" />
                                                </div> */}
                                                    <PermissionWrapper
                                                        functionalityName="Company"
                                                        moduleName="Manage Company"
                                                        actionId={4}
                                                        component={
                                                            <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center gap-3">
                                                                <div className='h-10 w-10 flex justify-center items-center bg-red-100 rounded-full cursor-pointer' onClick={() => handleDeleteCompanyDialog(company?.id)}>
                                                                    <CustomIcons iconName={'fa-solid fa-trash'} css='text-red-600' />
                                                                </div>
                                                            </div>
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )
                                }
                            </div>

                            {/* Fixed Add Button */}
                            <PermissionWrapper
                                functionalityName="Company"
                                moduleName="Manage Company"
                                actionId={1}
                                component={
                                    <div className='absolute bottom-5 right-5 rounded-full'>
                                        <div style={{ backgroundColor: theme.palette.primary.main }} className={`p-3 cursor-pointer rounded-full text-white flex justify-center`}
                                            onClick={() => handleAddCompany()}>
                                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer h-5 w-5' />
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    )
                }
                {
                    addcompany && (
                        <div className={`${(addcompany && !showCompanyDetails && currentWindowWidth <= 768) ? "block" : "hidden"} w-full`}>
                            <div>
                                <AddCompany setShowCompanyDetails={setShowCompanyDetails} id={companyId} setCompanyId={setCompanyId} setAddCompany={setAddCompany} handleGetCompanyDetails={handleGetCompanyDetails} selectedTabValue={editTab} setEditTab={setEditTab} handleGetSetectedCompanyDetails={handleGetCompany} />
                            </div>
                        </div>
                    )
                }
                <div className={`${(showCompanyDetails && currentWindowWidth <= 768) ? "block" : currentWindowWidth > 768 ? "block" : "hidden"} w-full`}>
                    {
                        addcompany && (
                            <div>
                                <AddCompany setShowCompanyDetails={setShowCompanyDetails} id={companyId} setCompanyId={setCompanyId} setAddCompany={setAddCompany} handleGetCompanyDetails={handleGetCompanyDetails} selectedTabValue={editTab} setEditTab={setEditTab} handleGetSetectedCompanyDetails={handleGetCompany} />
                            </div>
                        )
                    }
                    {
                        selectdCompanyDetails && (
                            <div className='py-2 px-4 lg:p-4 border rounded-lg bg-white relative'>
                                <div className='my-3 ml-0 lg:my-0 lg:ml-0'>
                                    <Tabs tabsData={tabData} selectedTab={selectedTab} handleChange={handleChangeTab} type='underline' />
                                </div>

                                <div className='min-h-[480px] md:min-h-[360px] lg:min-h-full'>
                                    <div className='my-2 flex justify-start md:justify-end items-center'>
                                        {
                                            !addEmployee && (
                                                <div className={`${(showCompanyDetails && currentWindowWidth <= 768) ? "block grow" : currentWindowWidth > 768 ? "hidden" : "hidden"} border rounded-full`}>
                                                    <Components.IconButton onClick={() => setShowCompanyDetails(false)}>
                                                        <CustomIcons iconName={'fa-solid fa-arrow-left'} css=' cursor-pointer h-5 w-5' />
                                                    </Components.IconButton>
                                                </div>
                                            )
                                        }
                                        <div className='w-full flex justify-end'>
                                            {
                                                selectedTab === 0 && (
                                                    <PermissionWrapper
                                                        functionalityName={"Company"}
                                                        moduleName={"Manage Company"}
                                                        actionId={2}
                                                        component={
                                                            <div style={{ backgroundColor: theme.palette.primary.main }} className='h-10 w-10 flex justify-center items-center rounded-full cursor-pointer text-white' onClick={() => handleEditAllCompanyDetails()} >
                                                                <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer' />
                                                            </div>
                                                        }
                                                    />
                                                )
                                            }
                                            {
                                                selectedTab === 1 && (
                                                    <PermissionWrapper
                                                        functionalityName={"Company"}
                                                        moduleName={"Manage Company"}
                                                        actionId={1}
                                                        component={
                                                            <div
                                                                style={{ backgroundColor: theme.palette.primary.main }}
                                                                className='h-10 w-10 flex justify-center items-center p-3 cursor-pointer rounded-full text-white'
                                                                onClick={() => handleAddNewLocation()}
                                                            >
                                                                <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer' />
                                                            </div>
                                                        }
                                                    />
                                                )
                                            }
                                            {
                                                (selectedTab === 2 && !userInfo?.companyId) && (
                                                    <PermissionWrapper
                                                        functionalityName={"Company"}
                                                        moduleName={"Manage Contact"}
                                                        actionId={1}
                                                        component={
                                                            <div style={{ backgroundColor: theme.palette.primary.main }} className='h-10 w-10 flex justify-center items-center p-3 cursor-pointer rounded-full text-white' onClick={() => handleAddEmployee()}>
                                                                <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer' />
                                                            </div>
                                                        }
                                                    />
                                                )
                                            }
                                        </div>
                                    </div>

                                    {selectedTab === 0 && (
                                        <div className='mt-4'>
                                            <div className='md:flex justify-start gap-6 md:items-start'>
                                                <PermissionWrapper
                                                    functionalityName="Company"
                                                    moduleName="Manage Company"
                                                    actionId={2}
                                                    component={
                                                        <div className='flex justify-center mb-4 md:grow'>
                                                            <div
                                                                className="w-28 h-28 border rounded-full flex items-center justify-center  cursor-pointer relative"
                                                                onClick={handleDivClick}
                                                            >
                                                                {(selectdCompanyDetails?.companyLogo !== null && selectdCompanyDetails?.companyLogo !== "") ? (
                                                                    <img
                                                                        src={selectdCompanyDetails?.companyLogo}
                                                                        alt="Preview"
                                                                        className="h-full w-full object-cover border rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="flex justify-center items-center h-full w-full">
                                                                        <User height={70} width={70} fill="#CED4DA" />
                                                                    </div>
                                                                )}
                                                                {(selectdCompanyDetails?.companyLogo !== null && selectdCompanyDetails?.companyLogo !== "") && (
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
                                                    }
                                                    fallbackComponent={
                                                        <div className='flex justify-center mb-4 md:grow'>
                                                            <div
                                                                className="w-28 h-28 border rounded-full flex items-center justify-center  cursor-pointer relative"
                                                            >
                                                                {(selectdCompanyDetails?.companyLogo !== null && selectdCompanyDetails?.companyLogo !== "") ? (
                                                                    <img
                                                                        src={selectdCompanyDetails?.companyLogo}
                                                                        alt="Preview"
                                                                        className="h-full w-full object-cover border rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="flex justify-center items-center h-full w-full">
                                                                        <User height={70} width={70} fill="#CED4DA" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 w-full">
                                                    <div className="flex">
                                                        <span style={{ color: theme.palette.primary.text.main, }} className="grow md:grow-0 text-sm md:text-medium font-semibold min-w-[120px] lg:min-w-[140px]">Company Id </span>
                                                        <span style={{ color: theme.palette.primary.text.main, }}>{selectdCompanyDetails?.companyNo ? selectdCompanyDetails?.companyNo : "-"}</span>
                                                    </div>
                                                    {CustomText("Company Name ", selectdCompanyDetails?.companyName, "companyName")}
                                                    {CustomText("GST Number ", selectdCompanyDetails?.ein, "ein")}
                                                    {CustomText("Organization Type ", selectdCompanyDetails?.organizationType, "organizationType")}
                                                    {CustomText("DBA ", selectdCompanyDetails?.dba, "dba")}
                                                    {CustomText("Industry ", selectdCompanyDetails?.industryName, "industryName")}
                                                    {CustomText("Phone Number ", selectdCompanyDetails?.phone, "phone")}
                                                    {CustomText("Email ", selectdCompanyDetails?.email, "email")}
                                                    {CustomText("Website ", selectdCompanyDetails?.websiteUrl, "websiteUrl")}
                                                </div>
                                            </div>
                                            {isEditingAll && (
                                                <div className='flex justify-end items-center gap-3 mt-3'>
                                                    <div className='w-20'>
                                                        <Button
                                                            text={'Cancel'}
                                                            useFor='disabled'
                                                            onClick={() => {
                                                                const hasError = inputData?.some(item => item.error)
                                                                if (hasError) {
                                                                    return
                                                                }
                                                                setIsEditingAll(false);
                                                                setInputData([]);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='w-20'>
                                                        <Button
                                                            text={'Save'}
                                                            type={'button'}
                                                            onClick={() => {
                                                                submit()
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {
                                        selectedTab === 1 && (
                                            <div className='mt-4 overflow-x-auto'>
                                                <table className="w-full border-collapse  border border-gray-300 h-full">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">#</th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Location Name</th>
                                                            {/* <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Time Zone</th> */}
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Address</th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Country</th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">State</th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">City</th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Zip Code</th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Employees</th>
                                                            <th style={{ color: theme.palette.primary.text.main }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                <p>
                                                                    Status
                                                                    <Tooltip title="Geofence is required for active location" placement="bottom" arrow>
                                                                        <span>
                                                                            <CustomIcons iconName="fa-solid fa-circle-info" css="cursor-pointer" />
                                                                        </span>
                                                                    </Tooltip>
                                                                </p>
                                                            </th>
                                                            <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    {locationData?.length !== 0 ? (
                                                        <tbody>
                                                            {locationData?.map((item, index) => (
                                                                <tr key={index} className="text-center">
                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {index + 1}
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.locationName ? item?.locationName : "-"
                                                                        }
                                                                    </td>

                                                                    {/* <td style={{ color: theme.palette.primary.text.main }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.timeZone ? item?.timeZone : "-"
                                                                        }
                                                                    </td> */}

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        <p className="pb-1 border-b border-gray-300">
                                                                            {
                                                                                item?.address1
                                                                            }
                                                                        </p>
                                                                        <p className="pt-1">
                                                                            {
                                                                                item?.address2
                                                                            }
                                                                        </p>
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.country ? item?.country : "-"
                                                                        }
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.state ? item?.state : "-"
                                                                        }
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.city ? item?.city : "-"
                                                                        }
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.zipCode ? item?.zipCode : "-"
                                                                        }
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.employeeCount ? item?.employeeCount : "-"
                                                                        }
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        {
                                                                            item?.isActive === 1 ? "Active" : "Inactive"
                                                                        }
                                                                    </td>

                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                        <div className="flex justify-center items-center gap-2">
                                                                            {/* {
                                                                                !userInfo?.userId && ( */}
                                                                            <PermissionWrapper
                                                                                functionalityName={"Company"}
                                                                                moduleName={"Manage Company"}
                                                                                actionId={2}
                                                                                component={
                                                                                    <div className="h-6 w-6 md:h-8 md:w-8 flex justify-center items-center bg-green-600 cursor-pointer rounded-full text-white"
                                                                                        onClick={() => handleOpenGeofencesModel(index, item)}>
                                                                                        <CustomIcons iconName={'fa-solid fa-location-dot'} css='cursor-pointer' />
                                                                                    </div>
                                                                                }
                                                                            />
                                                                            {/* )
                                                                            } */}
                                                                            <PermissionWrapper
                                                                                functionalityName={"Company"}
                                                                                moduleName={"Manage Company"}
                                                                                actionId={2}
                                                                                component={
                                                                                    <div
                                                                                        className='h-8 w-8 flex justify-center items-center bg-blue-600 cursor-pointer rounded-full text-white'
                                                                                        onClick={() => handleEditLocation(item.id)}
                                                                                    >
                                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer' />
                                                                                    </div>
                                                                                }
                                                                            />
                                                                            <PermissionWrapper
                                                                                functionalityName={"Company"}
                                                                                moduleName={"Manage Company"}
                                                                                actionId={3}
                                                                                component={
                                                                                    <div
                                                                                        className='h-8 w-8 flex justify-center items-center bg-red-600 cursor-pointer rounded-full text-white'
                                                                                        onClick={() => handleDeleteLocationDialog(item?.geofenceId, item?.id, index)}
                                                                                    >
                                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer' />
                                                                                    </div>
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    ) : (
                                                        <tbody>
                                                            <tr style={{ color: theme.palette.primary.text.main, }} className='text-center text-red-500 font-semibold capitalize h-10'>
                                                                <td colSpan={10}> No data found</td>
                                                            </tr>
                                                        </tbody>
                                                    )}
                                                </table>
                                            </div>
                                        )
                                    }
                                    {
                                        (selectedTab === 2 && userInfo?.companyId && (userInfo?.roleName === "Admin" || userInfo?.roleName === "Owner")) ? (
                                            <CompanyTheme />
                                        ) : selectedTab === 2 ?
                                            <div className='mt-4  overflow-x-auto'>
                                                {
                                                    addEmployee ? (
                                                        <AddEmployee companyId={companyId} employeeId={employeeId} setAddEmployee={setAddEmployee} setEmployeeId={setEmployeeId} handleGetAllEmployees={handleGetAllEmployees} />
                                                    ) :
                                                        <div>
                                                            <table className="w-full border-collapse border border-gray-300 h-full">
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                            #
                                                                        </th>
                                                                        <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                            UserName
                                                                        </th>
                                                                        <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                            Email
                                                                        </th>
                                                                        <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                            Phone
                                                                        </th>
                                                                        <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                            Role
                                                                        </th>
                                                                        <th style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 px-5 text-sm bg-gray-200 h-10">
                                                                            Actions
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                {
                                                                    employees?.length > 0 ? (
                                                                        <tbody>
                                                                            {employees?.map((item, index) => (
                                                                                <tr key={index} className="text-center">
                                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                                        {index + 1}
                                                                                    </td>
                                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                                        {item?.userName}
                                                                                    </td>
                                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                                        {item?.email}
                                                                                    </td>
                                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                                        {item?.phone}
                                                                                    </td>
                                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                                        {item?.companyEmployeeRolesDto?.roleName}
                                                                                    </td>
                                                                                    <td style={{ color: theme.palette.primary.text.main, }} className="border border-gray-300 p-2 text-center font-semibold text-sm break-words">
                                                                                        <div className="flex justify-center items-center gap-3">
                                                                                            <PermissionWrapper
                                                                                                functionalityName={"Company"}
                                                                                                moduleName={"Manage Contact"}
                                                                                                actionId={2}
                                                                                                component={
                                                                                                    <div className='h-8 w-8 flex justify-center items-center bg-blue-600 cursor-pointer rounded-full text-white' onClick={() => handleAddEmployee(item?.employeeId)}>
                                                                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer' />
                                                                                                    </div>
                                                                                                }
                                                                                            />
                                                                                            <PermissionWrapper
                                                                                                functionalityName={"Company"}
                                                                                                moduleName={"Manage Contact"}
                                                                                                actionId={3}
                                                                                                component={
                                                                                                    <div className='h-8 w-8 flex justify-center items-center bg-red-600 cursor-pointer rounded-full text-white' onClick={() => handleDeleteEmployeeDialog(item?.employeeId)} >
                                                                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer' />
                                                                                                    </div>
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>

                                                                    ) :
                                                                        <tbody>
                                                                            <tr className='text-center text-red-500 font-semibold capitalize h-10'>
                                                                                <td style={{ color: theme.palette.primary.text.main, }} colSpan={7}> No data found</td>
                                                                            </tr>
                                                                        </tbody>
                                                                }
                                                            </table>
                                                        </div>
                                                }
                                            </div>
                                            : null
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
            <AlertDialog open={dialog.open} title={dialog.title} message={dialog.message} actionButtonText={dialog.actionButtonText} handleAction={handleDeleteCompany} handleClose={handleCloseDialog} loading={loading} note="Company deactivation will automatically disable access for all associated users and archive all company-related data." />
            <AlertDialog open={dialogEmployee.open} title={dialogEmployee.title} message={dialogEmployee.message} actionButtonText={dialogEmployee.actionButtonText} handleAction={handleDeleteEmployee} handleClose={handleCloseEmployeeDialog} loading={loading} />
            <AlertDialog open={dialogLocation.open} title={dialogLocation.title} message={dialogLocation.message} actionButtonText={dialogLocation.actionButtonText} handleAction={handleDeleteLocation} handleClose={handleCloseLocationDialog} loading={loading} />
            <AlertDialog open={dialogGeofence.open} title={dialogGeofence.title} message={dialogGeofence.message} actionButtonText={dialogGeofence.actionButtonText} handleAction={handleCloseGeofencesDialog} handleClose={handleCloseGeofencesDialog} loading={loading} />
            <AddGeofences open={showGeofencesModel} handleClose={handleCloseGeofencesModel} selectedLocationRow={selectedGeofences} companyId={companyId} handleGetLocations={handleGetAllLocationsByCompanyId} />
            <AddLocationModel open={locationModal} handleClose={handleCloseLocationModal} locationId={editLocationId} companyId={companyId} handleGetLocations={handleGetAllLocationsByCompanyId} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetTitle,
    handleSetCompanyLogo
};

export default connect(null, mapDispatchToProps)(CompanyDetails)