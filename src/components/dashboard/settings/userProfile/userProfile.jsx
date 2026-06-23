import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as User } from "../../../../assets/svgs/user-alt.svg";

import { connect } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { handleSetTitle, handleSetUserDetails, setAlert } from '../../../../redux/commonReducers/commonReducers';
import { Tabs } from '../../../common/tabs/tabs'
import Button from '../../../common/buttons/button';

import { getAllCountry } from '../../../../service/country/countryService';
import { getAllStateByCountry } from '../../../../service/state/stateService';

import DatePickerComponent from '../../../common/datePickerComponent/datePickerComponent';
import { deleteProfileImage, getUser, resetPassword, updateUser, uploadProfileImage } from '../../../../service/users/usersServices';
import Select from '../../../common/select/select';
import Input from '../../../common/input/input';
import { uploadFiles } from '../../../../service/common/commonService';
import CustomIcons from '../../../common/icons/CustomIcons';
import { deleteEmployeeImage, getCompanyEmployee, updateEmployee, uploadEmployeeImage } from '../../../../service/companyEmployee/companyEmployeeService';
import { useTheme } from '@mui/material';

const GenderOptions = [
  { id: 1, title: "Male" },
  { id: 2, title: "Female" }
]

const UserProfile = ({ setAlert, handleSetTitle, handleSetUserDetails, userDetails }) => {

  const theme = useTheme()
  const userInfo = userDetails || JSON.parse(localStorage.getItem("userInfo"))
  // const [showPasswordRequirement, setShowPasswordRequirement] = useState(false)

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      profileImage: "",
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dob: '',
      password: '',
      currentPassword: "",
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
      birthDate: '',
      emergencyContact: '',
      contactPhone: '',
      relationship: '',
      phone: '',
      userName: ""
    },
  });

  const tabData = [
    {
      label: "Account",
      icon: <CustomIcons iconName={'fa-solid fa-user'} css='cursor-pointer' />
    },
    {
      label: "Security",
      icon: <CustomIcons iconName={'fa-solid fa-unlock'} css='cursor-pointer' />
    }
  ]

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [countryData, setCountryData] = useState([])
  const [stateData, setStateData] = useState([])

  const [selectedTab, setSelectedTab] = useState(0)
  // const [passwordError, setPasswordError] = useState([
  //   {
  //     condition: (value) => value.length >= 8,
  //     message: 'Minimum 8 characters long',
  //     showError: true,
  //   },
  //   {
  //     condition: (value) => /[a-z]/.test(value),
  //     message: 'At least one lowercase character',
  //     showError: true,
  //   },
  //   {
  //     condition: (value) => /[\d@$!%*?&\s]/.test(value),
  //     message: 'At least one number, symbol, or whitespace character',
  //     showError: true,
  //   },
  // ]);

  // const validatePassword = (value) => {
  //   const updatedErrors = passwordError.map((error) => ({
  //     ...error,
  //     showError: !error.condition(value),
  //   }));
  //   setPasswordError(updatedErrors);
  //   return updatedErrors.every((error) => !error.showError) || 'Password does not meet all requirements.';
  // };

  const toggleCurrentPasswordVisibility = () => {
    setIsCurrentPasswordVisible((prev) => !prev);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };

  const handleChangeTab = (index) => {
    setSelectedTab(index)
  }

  const handleGetUser = async () => {
    if (userInfo?.companyId && userInfo?.employeeId) {
      const response = await getCompanyEmployee(userInfo?.employeeId)
      if (response?.data?.result) {
        reset(response?.data?.result)
        setValue("gender", response?.data?.result?.gender === "Male" ? 1 : (response?.data?.result?.gender !== "" && response?.data?.result?.gender !== null) ? 2 : "")
        setValue("confirmPassword", "")
        setValue("password", "")
      }
    } else {
      const response = await getUser(userInfo?.userId)
      if (response?.data?.result) {
        reset(response?.data?.result)
        setValue("gender", response?.data?.result?.gender === "Male" ? 1 : 2)
        setValue("confirmPassword", "")
        setValue("password", "")
      }
    }
  }

  const submit = async (data) => {
    const newData = {
      ...data,
      gender: parseInt(watch("gender")) === 1 ? "Male" : watch("gender") !== null ? "Female" : "",
      password: userInfo?.password
    }
    setLoading(true)
    if (userInfo?.companyId && userInfo.employeeId) {
      const response = await updateEmployee(userInfo?.employeeId, newData)
      if (response?.data?.status === 200) {
        setAlert({ open: true, message: "Profile updated successfully", type: "success" })
        setLoading(false)
        setIsPasswordVisible(false)
        setIsConfirmPasswordVisible(false)
        handleGetUser()
      } else {
        setAlert({ open: true, message: response.data.message, type: "error" })
        setLoading(false)
      }
    } else {
      const response = await updateUser(userInfo?.userId, newData)
      if (response?.data?.status === 200) {
        setAlert({ open: true, message: "Profile updated successfully", type: "success" })
        setLoading(false)
        setIsPasswordVisible(false)
        setIsConfirmPasswordVisible(false)
        handleGetUser()
      } else {
        setAlert({ open: true, message: response.data.message, type: "error" })
        setLoading(false)
      }
    }
  }

  const changePassword = async (data) => {
    const newData = {
      currentPassword: data.currentPassword,
      password: data.password,
      ...(userInfo?.userId && { userId: userInfo.userId }),
      ...(userInfo?.companyId && { companyId: userInfo.companyId?.toString() }),
      ...(userInfo?.employeeId && { employeeId: userInfo.employeeId?.toString() })
    };

    setLoading(true)
    const response = await resetPassword(newData)
    if (response?.data?.status === 200) {
      // setAlert({ open: true, message: response.data.message, type: "success" })
      setLoading(false)
      setIsPasswordVisible(false)
      setIsConfirmPasswordVisible(false)
      setIsCurrentPasswordVisible(false)
      reset({
        password: '',
        currentPassword: "",
        confirmPassword: "",
      })
      handleGetUser()
    } else if (response.data?.result?.passwordNotMatch) {
      setAlert({ open: true, message: response.data?.result?.passwordNotMatch, type: "error" })
      setLoading(false)
    } else {
      setAlert({ open: true, message: response.data.message, type: "error" })
      setLoading(false)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setValue("profileImage", URL.createObjectURL(file));
    }
    let formData = new FormData();
    formData.append("files", file);
    formData.append("folderName", (userInfo?.companyId && userInfo.employeeId) ? `employeeProfile/${userInfo?.employeeId}` : "profileImages");
    formData.append("userId", (userInfo?.companyId && userInfo.employeeId) ? userInfo?.companyId : userInfo?.userId);

    uploadFiles(formData).then((res) => {
      if (res.data.status === 200) {
        const { imageURL } = res?.data?.result?.uploadedFiles?.[0];
        if (userInfo?.companyId && userInfo.employeeId) {
          uploadEmployeeImage({ employee: imageURL, companyId: userInfo?.companyId, employeeId: userInfo?.employeeId }).then((response) => {
            if (response.data.status === 200) {
              let JsonData = JSON.parse(localStorage.getItem('userInfo'))
              JsonData = {
                ...JsonData,
                profileImage: response.data.result
              }
              localStorage.setItem("userInfo", JSON.stringify(JsonData))
              handleSetUserDetails(JsonData)
            } else {
              setAlert({ open: true, message: res?.data?.message, type: "error" })
            }
          })
        } else {
          uploadProfileImage({ profileImage: imageURL }).then((res) => {
            if (res.data.status === 200) {
              let JsonData = JSON.parse(sessionStorage.getItem('userInfo'))
              JsonData = {
                ...JsonData,
                profileImage: res.data.result
              }
              sessionStorage.setItem("userInfo", JSON.stringify(JsonData))
            } else {
              setAlert({ open: true, message: res?.data?.message, type: "error" })
            }
          })
        }
      } else {
        setAlert({ open: true, message: res?.data?.message, type: "error" })
      }
    });

  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleReset = async () => {
    if (userInfo?.companyId && userInfo.employeeId) {
      const res = await deleteEmployeeImage(userInfo?.companyId, userInfo.employeeId);
      if (res?.data?.status !== 200) {
        setAlert({ open: true, message: res.data.message, type: "error" })
        return
      }
      setValue("profileImage", "");
      let JsonData = JSON.parse(localStorage.getItem('userInfo'))
      JsonData = {
        ...JsonData,
        profileImage: ""
      }
      localStorage.setItem("userInfo", JSON.stringify(JsonData))
      handleSetUserDetails(JsonData)

      fileInputRef.current.value = null;
    } else {
      const res = await deleteProfileImage();
      if (res?.data?.status !== 200) {
        setAlert({ open: true, message: res.data.message, type: "error" })
        return
      }
      setValue("profileImage", null)
      let JsonData = JSON.parse(sessionStorage.getItem('userInfo'))
      JsonData = {
        ...JsonData,
        profileImage: ""
      }
      sessionStorage.setItem("userInfo", JSON.stringify(JsonData))
      fileInputRef.current.value = null;
    }

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

  useEffect(() => {
    handleSetTitle("Profile")
    document.title = "Profile - Calculate Salary";
    handleGetUser()
    handleGetAllCountrys()
  }, [])

  useEffect(() => {
    if (countryData?.length > 0 && watch("country")) {
      handleGetAllStatesByCountryId(countryData?.filter((item) => item.title === watch("country"))?.[0]?.id)
    }
  }, [countryData])


  return (
    <div className='px-3 lg:px-0'>

      <div className="mb-3">
        <Tabs tabsData={tabData} selectedTab={selectedTab} handleChange={handleChangeTab} type='underline' />
      </div>

      <div className='border rounded-lg bg-white w-full p-5'>
        {
          selectedTab === 0 && (
            <>
              <div className="md:flex justify-start gap-5">
                {/* Image Preview Box */}
                <div className="h-24 w-24 border rounded-md flex items-center justify-center overflow-hidden cursor-pointer" onClick={handleUploadClick}>
                  {watch("profileImage") ? (
                    <img
                      src={watch("profileImage")}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full w-full">
                      <User height={50} width={50} fill="#CED4DA" />
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex justify-start gap-3 items-center md:w-96">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    {/* Upload Button */}
                    <div className="w-full">
                      <Button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={handleUploadClick}
                        text={"Upload New Photo"}
                      />
                    </div>

                    {/* Reset Button */}
                    <div className="md:w-56">
                      <Button
                        className={`px-4 py-2 bg-red-500 text-white rounded-md`}
                        onClick={handleReset}
                        text={"Delete"}
                        useFor='error'
                        disabled={!watch("profileImage")}
                      />
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="py-3">
                    <p className="text-gray-600">Allowed JPG, PNG or JPEG.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(submit)} className='mt-8'>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
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
                          error={errors.firstName}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* {
                    (!userInfo?.companyId && !userInfo?.employeeId) && ( */}
                  <div>
                    <Controller
                      name="middleName"
                      // rules={{
                      //   required: "Middle name is required",
                      // }}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Middle Name"
                          type={`text`}
                          // error={errors.middleName}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  {/* )
                  } */}

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
                          error={errors.lastName}
                          onChange={(e) => {
                            field.onChange(e);
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
                          error={errors.userName}
                          onChange={(e) => {
                            field.onChange(e);
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

                  {/* {
                    (!userInfo?.companyId && !userInfo?.employeeId) && ( */}
                  <div>
                    <Controller
                      name="zipCode"
                      control={control}
                      // rules={{
                      //   required: "Zip code is required",
                      // }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Zip Code"
                          type={`text`}
                          // error={errors.zipCode}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  {/* )
                  } */}

                  <div>
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

                  {/* {
                    (!userInfo?.companyId && !userInfo?.employeeId) && ( */}
                  <div>
                    <DatePickerComponent
                      setValue={setValue}
                      control={control}
                      name="dob"
                      label="Birth Date"
                      minDate={null}
                      maxDate={new Date()}   // ✅ pass Date object, not string
                    />
                  </div>

                  {/* )
                  } */}

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
                          error={errors.phone}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(numericValue);
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* {
                    (!userInfo?.companyId && !userInfo?.employeeId) && ( */}
                  <>
                    <div>
                      <Controller
                        name="emergencyContact"
                        control={control}

                        render={({ field }) => (
                          <Input
                            {...field}
                            label="Emergency Contact Name"
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
                        name="contactPhone"
                        control={control}
                        rules={{
                          required: watch("contactPhone") ? "Phone is required" : false,
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
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(numericValue);
                            }}
                            error={errors.contactPhone}
                          />
                        )}
                      />
                    </div>

                    <div>
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
                  </>
                  {/* )
                  } */}
                </div>

                <div className='flex justify-end gap-4 mt-3'>
                  <div>
                    <Button type={'submit'} text={"Save Profile"} isLoading={loading} />
                  </div>
                </div>
              </form>
            </>
          )
        }
        {
          selectedTab === 1 && (
            <>
              <div style={{ color: theme.palette.primary.text.main }} className='font-semibold text-lg mb-5'>
                <p>Change Pin</p>
              </div>

              <form onSubmit={handleSubmit(changePassword)}>
                <div className='grid md:grid-cols-2 gap-6 mb-5'>
                  <div>
                    <Controller
                      name="currentPassword"
                      control={control}
                      rules={{
                        required: "Current pin is required",
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Current Pin"
                          type={`${isCurrentPasswordVisible ? 'text' : 'password'}`}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          error={errors.currentPassword}
                          helperText={errors.currentPassword && errors.currentPassword.message}
                          endIcon={
                            <span
                              onClick={toggleCurrentPasswordVisibility}
                              style={{ cursor: 'pointer', color: 'white' }}
                            >
                              {isCurrentPasswordVisible ? (
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

                <div className='grid md:grid-cols-2 gap-6 mb-5'>
                  <div className='relative'>
                    <Controller
                      name="password"
                      control={control}
                      rules={{
                        required: "Pin is required",
                        // validate: (value) => {
                        //   if (value.length < 8) {
                        //     return "Password must be at least 8 characters";
                        //   }
                        // }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Pin"
                          type={`${isPasswordVisible ? 'text' : 'password'}`}
                          onChange={(e) => {
                            field.onChange(e);
                            // validatePassword(e.target.value)
                          }}
                          // onFocus={(e) => {
                          //   setShowPasswordRequirement(true)
                          // }}
                          // onBlur={(e) => {
                          //   setShowPasswordRequirement(false)
                          // }}
                          error={errors.password}
                          helperText={errors.password && errors.password.message}
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
                          helperText={errors.confirmPassword && errors.confirmPassword.message}
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

                {/* <div>
                  {passwordError.map((error, index) => (
                    <div key={index} className="flex items-center md:w-2/6">
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
                </div> */}

                <div className='flex justify-end gap-4 mt-5'>
                  <div>
                    <Button type={'submit'} text={"Save Pin"} isLoading={loading} />
                  </div>
                </div>
              </form>
            </>
          )
        }
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  title: state.common.title,
  userDetails: state.common.userDetails,
});

const mapDispatchToProps = {
  setAlert,
  handleSetTitle,
  handleSetUserDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile)
