import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from "react-hook-form";
import Cookies from 'js-cookie';

import Input from '../../common/input/input';
import Button from '../../common/buttons/button';
import Checkbox from '../../common/checkBox/checkbox';

import { login } from '../../../service/auth/authService';
import { handleSetUserDetails, setAlert, handleSetTheme, setLoading } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import { getRole } from '../../../service/roles/roleService';
import { getEmployeeRole } from '../../../service/companyEmployeeRole/companyEmployeeRoleService';
import CustomIcons from '../../common/icons/CustomIcons';
import { useTheme } from '@mui/material';
import { getCompanyTheme } from '../../../service/companyTheme/companyThemeService';
import { getLocations } from '../../../service/location/locationService';
import { radarPKAPIKey } from '../../../config/apiConfig/apiConfig';
import { getAccurateLocation } from '../../../service/common/radarService';
import FaceRegistration from '../../models/faceRegistration/faceRegistration';

const Login = ({ setAlert, handleSetUserDetails, handleSetTheme, setLoading }) => {
    const theme = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [remember, setRemember] = useState(localStorage.getItem("checked") ? localStorage.getItem("checked") : false)
    const [showCompanyId, setShowCompanyId] = useState(true)

    const navigate = useNavigate()
    const [showFaceRegistration, setShowFaceRegistration] = useState(false);
    const [loginInfo, setLoginInfo] = useState(null);

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors },
        setError,
    } = useForm({
        defaultValues: {
            companyId: localStorage.getItem("companyId") ? localStorage.getItem("companyId") : "",
            userName: localStorage.getItem("userName") ? localStorage.getItem("userName") : "",
            password: localStorage.getItem("password") ? localStorage.getItem("password") : "",
        },
    });

    const handleOpenFaceRegistration = () => {
        setShowFaceRegistration(true);
    }

    const handleCloseFaceRegistration = () => {
        setShowFaceRegistration(false);
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev);
    };

    const handleForgotPin = () => {
        localStorage.setItem("companyId", watch("companyId"))
        navigate("/forgotpin")
    }

    const checkGeofenceStatus = async (allowedExternalIds, radarUserId) => {
        try {
            const location = await getAccurateLocation();

            if (!window.Radar) {
                console.error("Radar SDK not loaded.");
                return false;
            }

            if (!location?.latitude || !location?.longitude) {
                console.error("Location data not available.");
                return false;
            }

            const { latitude, longitude, accuracy } = location;

            const formattedLatitude = parseFloat(latitude.toFixed(5));
            const formattedLongitude = parseFloat(longitude.toFixed(5));

            window.Radar.initialize(radarPKAPIKey);
            window.Radar.setUserId(`timesheetspro_user_${radarUserId}`);

            return new Promise((resolve) => {
                window.Radar.trackOnce(
                    {
                        latitude: formattedLatitude,
                        longitude: formattedLongitude,
                        accuracy: Math.min(accuracy, 30),
                    },
                    (status, loc, user, events) => {
                        const geofences = [
                            ...(user?.user?.geofences || []),
                            ...(events?.map(e => e?.geofence).filter(Boolean) || []),
                        ];
                        for (const g of geofences) {
                            const geofenceExternalId = g?.externalId;

                            const matchedLocation = allowedExternalIds.find(
                                loc => loc.externalId === geofenceExternalId
                            );

                            if (matchedLocation?.locationId !== undefined) {
                                sessionStorage.setItem("locationId", matchedLocation.locationId);
                                console.log("✅ Matched geofence:", geofenceExternalId);
                                resolve({ isInside: true, location });
                                return; // 🔥 breaks loop + exits function
                            }
                        }

                        console.log("❌ No matching geofence found.");
                        resolve({ isInside: false, location });

                        // for (const g of geofences) {
                        //     const geofenceExternalId = g?.externalId;
                        //     if (allowedExternalIds.map(loc => loc.externalId).includes(geofenceExternalId)) {
                        //         console.log("allowedExternalIds",allowedExternalIds)
                        //         const locationId = allowedExternalIds.find(loc => loc.externalId === geofenceExternalId)?.locationId;
                        //         if (locationId !== undefined) {
                        //             sessionStorage.setItem("locationId", locationId);
                        //             console.log("✅ Matched geofence:", geofenceExternalId);
                        //             resolve({ isInside: true, location });
                        //             return;
                        //         }
                        //     }
                        // }

                        console.log("❌ No matching geofence found.");
                        resolve({ isInside: false, location });
                    }
                );
            });
        } catch (error) {
            console.error("Error checking geofence status:", error);
            return { isInside: false, location: null };
        }
    };

    const submit = async (data) => {
        const response = await login(data)
        if (response.data.status === 200) {
            localStorage.setItem("companyId", watch("companyId"))
            localStorage.setItem('userInfo', JSON.stringify(response.data.result?.data))
            handleSetUserDetails(response.data.result?.data)
            if (remember) {
                localStorage.setItem("userName", watch("userName"))
                localStorage.setItem("password", watch("password"))
                localStorage.setItem("checked", remember)
            } else {
                if (localStorage.getItem("userName") || localStorage.getItem("password")) {
                    localStorage.removeItem("userName")
                    localStorage.removeItem("password")
                    localStorage.removeItem("checked")
                }
            }

            if (!response.data.result?.data?.companyId) {
                const res = await getRole(response.data.result?.data?.roleId);
                localStorage.setItem('permissions', JSON.stringify(res.data?.result?.role?.rolesActions?.functionalities))
                navigate('/dashboard')
            } else {
                if (response.data.result?.data?.themeId) {
                    const theme = await getCompanyTheme(response.data.result?.data?.themeId)
                    if (theme.data.status === 200) {
                        localStorage.setItem("theme", JSON.stringify(theme.data.result))
                        handleSetTheme(theme.data.result)
                    }

                    if (response?.data?.result?.data?.checkGeofence === 1 && response?.data?.result?.data?.roleName !== 'Admin' && response?.data?.result?.data?.roleName !== 'Owner') {
                        if (response.data.result?.data?.companyLocation) {
                            const locations = await getLocations(JSON.parse(response.data.result?.data?.companyLocation));
                            if (locations.data.status === 200) {
                                const locationData = locations?.data?.result?.map(item => ({
                                    externalId: item.externalId,
                                    locationId: item.id
                                }));

                                setLoading(true)
                                if (locationData?.some(loc => loc.externalId === '' || loc.externalId === null || loc.externalId === undefined)) {
                                    setAlert({
                                        open: true,
                                        message: "Geofence data is missing or incomplete for one or more locations. Please configure geofencing for your company's location(s) to proceed.",
                                        type: "error"
                                    });
                                    localStorage.setItem("timeInAllow", 0)
                                    setLoading(false)
                                    return;
                                }
                                const allowedExternalIds = locationData?.map((loc, i) => {
                                    return {
                                        externalId: loc.externalId,
                                        locationId: loc.locationId
                                    }
                                });
                                const isInsideGeofence = await checkGeofenceStatus(allowedExternalIds, response.data.result?.data?.employeeId);
                                localStorage.setItem("timeInAllow", isInsideGeofence?.isInside ? 1 : 0)
                                Cookies.set('authToken', response.data.result?.token, { expires: 1 });

                                if (!isInsideGeofence?.isInside) {
                                    setLoading(false)
                                    setAlert({
                                        open: true,
                                        message: "You are not inside the geofenced area.",
                                        type: "error"
                                    });
                                    return
                                }
                            }
                        }
                    } else {
                        Cookies.set('authToken', response.data.result?.token, { expires: 1 });
                        localStorage.setItem("timeInAllow", 1)
                    }
                    const res = await getEmployeeRole(response.data.result?.data?.roleId)
                    localStorage.setItem('permissions', JSON.stringify(res.data?.result?.rolesActions?.functionalities))
                }
                if (!response.data.result?.data?.companyId) {
                    Cookies.set('authToken', response.data.result?.token, { expires: 1 });
                    navigate('/dashboard')
                } else {
                    Cookies.set('authToken', response.data.result?.token, { expires: 1 });
                    navigate('/dashboard/main')
                }
                // setAlert({ open: true, message: response.data.message, type: "success" })
            }
        } else {
            setAlert({ open: true, message: response.data.message, type: "error" });
            if (response.data.result && response.data?.result?.errors) {
                response.data.result.errors.forEach((error) => {
                    const [field, message] = Object.entries(error)[0];
                    setError(field, { type: "manual", message });
                });
            }
        }
    };

    useEffect(() => {
        document.title = "Signin-TimeSheetsPro"
        if (Cookies.get('authToken')) {
            navigate('/dashboard')
        }
        if (localStorage.getItem("companyId")) {
            setShowCompanyId(false)
            // navigate('/dashboard')
        }
    }, [])

    useEffect(() => {
        if (loginInfo?.companyId) {
            submit(loginInfo);
        }
    }, [loginInfo]);

    return (
        <div className='relative'>
            <div className='flex min-h-screen md:mt-0 justify-center items-center md:min-h-screen'>
                <div className='shadow-[0_0.25rem_0.875rem_0_rgba(38,43,67,0.16)] p-5 w-[-webkit-fill-available] m-8 md:m-0 md:p-7 md:w-[28rem] rounded-lg bg-white'>
                    <div className='mb-6 mt-4 md:my-5 text-center'>
                        <p className='text-xl md:text-2xl font-semibold text-[#3b4056] capitalize'>
                            Sign in to your account
                        </p>
                    </div>
                    <form noValidate onSubmit={handleSubmit(submit)} className='px-2 sm:px-7 py-5 md:p-5'>
                        <div className='grid grid-rows gap-4'>
                            {
                                showCompanyId ? (
                                    <div>
                                        <Controller
                                            name="companyId"
                                            control={control}
                                            rules={{
                                                required: 'Company ID is required',
                                            }}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Company ID"
                                                    type="text"
                                                    placeholder="Enter your company ID"
                                                    error={errors.companyId}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                ) : <p className='font-semibold'>
                                    Company ID: {watch("companyId")}
                                </p>
                            }

                            <div>
                                <Controller
                                    name="userName"
                                    control={control}
                                    rules={{
                                        required: 'User name is required',
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="User Name"
                                            type="text"
                                            placeholder="Enter your username"
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
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: "Pin is required",
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Pin"
                                            type={`${isPasswordVisible ? 'text' : 'password'}`}
                                            placeholder="Enter your pin"
                                            error={errors.password}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
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

                            <div>
                                <div className='flex justify-between items-center'>
                                    <div>
                                        <Checkbox text={`Remember me`} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                                    </div>

                                    <div className='ml-2 mt-2 md:ml-0 md:mt-0'>
                                        <p style={{ color: theme.palette.primary.main }} className={`capitalize cursor-pointer`} onClick={() => handleForgotPin()}>Forgot pin?</p>
                                    </div>
                                </div>
                                <div className='ml-2 mt-2 md:ml-0 md:mt-2'>
                                    <p style={{ color: theme.palette.primary.main }} className={`capitalize cursor-pointer`} onClick={() => setShowCompanyId((prev) => !prev)}>Change Company ID?</p>
                                    {/* <Checkbox text={`Change Company`} checked={showCompanyId} onChange={(e) => setShowCompanyId(e.target.checked)} /> */}
                                </div>
                            </div>
                        </div>

                        <div className='mt-3 grid grid-rows gap-3'>
                            <div>
                                <Button type={`submit`} text={`Sign in`} />
                            </div>
                            <div>
                                <Button useFor='error' type={`button`} text={`Login With Face`} onClick={handleOpenFaceRegistration} />
                            </div>
                        </div>

                    </form>
                </div>
                <img
                    alt='mask'
                    src='/images/auth/TSP-Login-BG-2.png'
                    className='absolute -z-10 bottom-0 hidden lg:block w-screen'
                />
            </div>
            <FaceRegistration open={showFaceRegistration} handleClose={handleCloseFaceRegistration} type="login" setLoginInfo={setLoginInfo} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    handleSetUserDetails,
    handleSetTheme,
    setLoading
};

export default connect(null, mapDispatchToProps)(Login)