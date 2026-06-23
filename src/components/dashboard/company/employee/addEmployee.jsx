import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as User } from "../../../../assets/svgs/user-alt.svg";
import { Controller, useForm } from 'react-hook-form';
import { createEmployeeFromTSP, deleteEmployeeImage, getCompanyEmployee, updateEmployeeFromTSP, uploadEmployeeImage } from '../../../../service/companyEmployee/companyEmployeeService';
import { connect } from 'react-redux';
import { setAlert } from '../../../../redux/commonReducers/commonReducers';
import Input from '../../../common/input/input';
import Components from '../../../muiComponents/components';
import Button from '../../../common/buttons/button';
import { getStaticRoles, getStaticRolesWithPermissions, uploadFiles } from '../../../../service/common/commonService';
import { getAllCompanyRole } from '../../../../service/companyEmployeeRole/companyEmployeeRoleService';
import Select from '../../../common/select/select';
import CustomIcons from '../../../common/icons/CustomIcons';
import { getAllLocationsByCompanyId } from '../../../../service/location/locationService';
import SelectMultiple from '../../../common/select/selectMultiple';
import { getAllCountry } from '../../../../service/country/countryService';
import { getAllStateByCountry } from '../../../../service/state/stateService';

const GenderOptions = [
    { id: 1, title: "Male" },
    { id: 2, title: "Female" }
]

const AddEmployee = ({ setAlert, companyId, employeeId = null, setAddEmployee, setEmployeeId, handleGetAllEmployees }) => {

    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [formDataFile, setFormDataFile] = useState(null)
    const [roles, setRoles] = useState([])
    const [locations, setLocations] = useState([])
    const [countryData, setCountryData] = useState([])
    const [stateData, setStateData] = useState([])

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            profileImage: "",
            userName: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
            roleId: '',
            roleName: "",
            companyId: "",
            hourlyRate: "",
            gender: "",
            city: "",
            state: "",
            country: "",
            address1: "",
            address2: "",
            zipCode: "",
            companyLocation: [],

        },
    });

    const handleBack = () => {
        setAddEmployee(false)
        setEmployeeId(null)
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

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
            const selectedState = data?.filter((row) => row?.title === watch("state"))?.[0] || null
            setValue("state", selectedState?.title)
        }
    }

    const handleGetEmployee = async () => {
        if (employeeId) {
            const res = await getCompanyEmployee(employeeId);
            if (res?.data?.status === 200) {
                reset(res?.data?.result);
                // validatePassword(res?.data?.result?.password)
                setValue("gender", res?.data?.result?.gender === "Male" ? 1 : (res?.data?.result?.gender !== "" && res?.data?.result?.gender !== null) ? 2 : "")
                setValue("companyLocation", res?.data?.result?.companyLocation ? JSON.parse(res?.data?.result?.companyLocation) : [])

            }
        }
    }


    const submit = async (data) => {
        const newData = {
            ...data,
            roles: getStaticRolesWithPermissions(),
            companyId: companyId,
            gender: parseInt(watch("gender")) === 1 ? "Male" : watch("gender") !== null ? "Female" : "",
            companyLocation: watch("companyLocation")?.length > 0 ? JSON.stringify(watch("companyLocation")) : null,
        }
        if (employeeId) {
            const res = await updateEmployeeFromTSP(employeeId, newData);
            if (res?.data?.status === 200) {
                handleUploadImage(companyId, employeeId)
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: res?.data?.message || "Failed to update employee",
                });
            }
        } else {
            const res = await createEmployeeFromTSP(newData);
            if (res?.data?.status === 201) {
                handleUploadImage(companyId, res?.data?.result?.employeeId)
            } else {
                setAlert({
                    open: true,
                    type: "error",
                    message: res?.data?.message || "Failed to add employee",
                });
            }
        }
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormDataFile(file)
            setValue("profileImage", URL.createObjectURL(file));
        }
    }

    const handleUploadImage = (companyId, employeeId) => {
        if (!formDataFile) {
            handleGetAllEmployees()
            setEmployeeId(null)
            setAddEmployee(false)
            return
        } else {
            const formData = new FormData();
            formData.append("files", formDataFile);
            formData.append("folderName", `employeeProfile/${employeeId}`);
            formData.append("userId", companyId);

            uploadFiles(formData).then((res) => {
                if (res.data.status === 200) {
                    const { imageURL } = res?.data?.result?.uploadedFiles?.[0];
                    uploadEmployeeImage({ employee: imageURL, companyId: companyId, employeeId: employeeId }).then((res) => {
                        if (res.data.status !== 200) {
                            setAlert({ open: true, message: res?.data?.message, type: "error" })
                        } else {
                            setAddEmployee(false)
                            setEmployeeId(null)
                            handleGetAllEmployees()
                        }
                    })
                } else {
                    setAlert({ open: true, message: res?.data?.message, type: "error" })
                    setLoading(false)
                    return
                }
            });
        }
    }

    const handleDeleteImage = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (employeeId && formDataFile === null) {
            const response = await deleteEmployeeImage(companyId, employeeId);
            if (response.data.status === 200) {
                setValue("profileImage", "");
                setFormDataFile(null);
                handleGetAllEmployees()
            } else {
                setAlert({ open: true, message: response.data.message, type: "error" })
            }
        } else {
            setValue("profileImage", "");
            setFormDataFile(null);
        }
    }

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    const handleGetEmployeeRoles = async () => {
        const res = await getAllCompanyRole(companyId)
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item) => {
                return {
                    title: item?.roleName,
                    id: item?.roleId
                }
            })
            if (data?.length > 0) {
                setRoles(data)
            } else {
                setRoles(getStaticRoles())
            }
        }
    }

    const handleGetCompanyLocations = async () => {
        if (companyId) {
            const res = await getAllLocationsByCompanyId(companyId)
            if (res?.data?.status === 200) {
                const data = res?.data?.result?.map((item) => {
                    return {
                        title: item?.locationName,
                        id: item?.id
                    }
                })
                setLocations(data)
            }
        }
    }

    useEffect(() => {
        handleGetAllCountrys()
        handleGetEmployeeRoles()
    }, [])

    useEffect(() => {
        handleGetEmployee();
        handleGetCompanyLocations();
    }, [employeeId])

    useEffect(() => {
        if (countryData?.length > 0 && watch("country")) {
            handleGetAllStatesByCountryId(countryData?.filter((item) => item.title === watch("country"))?.[0]?.id)
        }
    }, [countryData])

    return (
        <div className='relative h-full'>
            <form onSubmit={handleSubmit(submit)}>
                <div className="flex items-center justify-center mb-5 mt-2">
                    <div
                        className="h-32 w-32 border rounded-full flex items-center justify-center  cursor-pointer relative"
                        onClick={handleDivClick}
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
                        {watch("profileImage") && (
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

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                    <div>
                        <Controller
                            name="firstName"
                            control={control}
                            rules={{
                                required: "First name is required",
                            }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="First Name"
                                    type={`text`}
                                    error={errors?.firstName}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div>
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
                                    error={errors?.lastName}
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
                                required: watch("email") ? "Email is required" : false,
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
                                    error={errors?.phone}
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
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={GenderOptions}
                                    label={"Gender"}
                                    placeholder="Select Gender"

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

                    <div>
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
                                    error={errors?.userName}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div className='relative'>
                        <Controller
                            name="password"
                            control={control}
                            rules={{ required: "Pin is required" }}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Pin"
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    error={errors?.password}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        // validatePassword(e.target.value);
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
                        {/* {
                            showPasswordRequirement && (
                                <div className='absolute border-gray-300 border-2 bg-gray-100 z-50 w-96 rounded-md p-2 
                   transition-all duration-300 transform translate-y-2 opacity-100'>
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

                    <div>
                        <Controller
                            name="roleId"
                            control={control}
                            rules={{
                                required: "Employee role is required",
                            }}
                            render={({ field }) => (
                                <Select
                                    options={roles}
                                    error={errors.roleId}
                                    label={"Employee Role"}
                                    placeholder="Select role"
                                    value={watch("roleId") || null}
                                    onChange={(_, newValue) => {
                                        if (newValue?.id) {
                                            field.onChange(newValue.id);
                                            setValue("roleName", newValue.title);
                                        } else {
                                            setValue("roleId", null);
                                            setValue("roleName", "");
                                        }
                                    }}
                                />
                            )}
                        />

                    </div>

                    <div>
                        <Controller
                            name="address1"
                            rules={{
                                required: "Address1 is required",
                            }}
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Address 1"
                                    type={`text`}
                                    error={errors?.address1}
                                    onChange={(e) => {
                                        field.onChange(e);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div>
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

                    <div>
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
                                            setValue("country", null);
                                        }
                                    }}
                                    error={errors?.country}
                                />
                            )}
                        />
                    </div>

                    <div>
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

                    <div>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="City"
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
                            name="zipCode"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="Zip Code"
                                    type={`text`}
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
                            name="companyLocation"
                            control={control}
                            rules={{
                                required: "Company location is required"
                            }}
                            render={({ field }) => (
                                <SelectMultiple
                                    options={locations}
                                    label={"Company Location"}
                                    placeholder="Select company location"
                                    value={field.value || []}
                                    onChange={(newValue) => {
                                        field.onChange(newValue);
                                    }}
                                    error={errors?.companyLocation}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className='flex justify-end mt-3 gap-3'>
                    <div>
                        <Button type={'submit'} text={"Submit"} isLoading={loading} />
                    </div>
                </div>
            </form>
            <div className='absolute border rounded-full top-0'>
                <Components.IconButton onClick={() => handleBack()}>
                    <CustomIcons iconName={'fa-solid fa-arrow-left'} css=' cursor-pointer h-5 w-5' />
                </Components.IconButton>
            </div>
        </div>
    )
}

const mapDispatchToProps = {
    setAlert
};

export default connect(null, mapDispatchToProps)(AddEmployee)

//  <div>
//                         <Controller
//                             name="hourlyRate"
//                             control={control}
//                             render={({ field }) => (
//                                 <Input
//                                     {...field}
//                                     label="Hourly Rate"
//                                     type={`text`}
//                                     onChange={(e) => {
//                                         const inputValue = e.target.value;
//                                         const numericValue = inputValue.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
//                                         field.onChange(numericValue);
//                                     }}
//                                 />
//                             )}
//                         />
//                     </div>