import React, { useEffect, useState } from 'react'

import { login } from '../service/auth/authService';
import { setAlert, setLoading } from '../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import { getLocations } from '../service/location/locationService';
import { radarPKAPIKey } from '../config/apiConfig/apiConfig';
import { getAccurateLocation } from '../service/common/radarService';
import FaceRegistration from './faceRegistration';
import { addUserTimeInPhone } from '../service/userInOut/userInOut';
import { speakMessage } from '../service/common/commonService';

const LoginIOS = ({ setAlert, setLoading }) => {
    const [loginInfo, setLoginInfo] = useState(null);

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
                            if (allowedExternalIds.map(loc => loc.externalId).includes(geofenceExternalId)) {
                                const locationId = allowedExternalIds.find(loc => loc.externalId === geofenceExternalId)?.locationId;
                                if (locationId !== undefined) {
                                    console.log("✅ Matched geofence:", geofenceExternalId);
                                    resolve({ isInside: true, locationId });
                                    return;
                                }
                            }
                        }

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

    const handleClockIn = async (employeeId, locationId, companyId) => {
        let params = `employeeId=${employeeId}`;
        if (locationId) {
            params += `&locationId=${locationId}`;
        }
        if (companyId) {
            params += `&companyId=${companyId}`;
        }
        try {
            const response = await addUserTimeInPhone(params);
            if (response?.data?.status === 201) {
                setAlert({
                    open: true,
                    message: response.data.message || "Clock-in successful",
                    type: "success"
                });
                await speakMessage("Thank you, You are in.");
            } else if (response?.data?.status === 200) {
                setAlert({
                    open: true,
                    message: response.data.message || "Clock-out successful",
                    type: "success"
                });
                await speakMessage("Thank you, You are out.");
            }
            else {
                setAlert({
                    open: true,
                    message: response.data.message || "Clock-in failed",
                    type: "error"
                });
            }
        } catch (error) {
            console.error("Error during clock-in:", error);
        }
    };

    const submit = async (data) => {
        const response = await login(data)
        let locationId = null;
        let companyId = response?.data?.result?.data?.companyId;

        if (response.data.status === 200) {
            if (response?.data?.result?.data?.checkGeofence === 1 && response?.data?.result?.data?.roleName !== 'Admin' && response?.data?.result?.data?.roleName !== 'Owner') {
                if (response.data.result?.data?.companyLocation) {
                    const locations = await getLocations(JSON.parse(response.data.result?.data?.companyLocation));
                    if (locations.data.status === 200) {
                        const locationData = locations?.data?.result?.map(item => ({
                            externalId: item.externalId,
                        }));

                        setLoading(true)
                        if (locationData?.some(loc => loc.externalId === '' || loc.externalId === null || loc.externalId === undefined)) {
                            setAlert({
                                open: true,
                                message: "Geofence data is missing or incomplete for one or more locations. Please configure geofencing for your company's location(s) to proceed.",
                                type: "error"
                            });
                            setLoading(false)
                            return;
                        }
                        const allowedExternalIds = locationData?.map((loc, i) => {
                            return {
                                externalId: loc.externalId,
                                locationId: i.id
                            }
                        });

                        const isInsideGeofence = await checkGeofenceStatus(allowedExternalIds, response.data.result?.data?.employeeId);
                        if (isInsideGeofence?.locationId) {
                            locationId = isInsideGeofence.locationId;
                        }
                        if (!isInsideGeofence?.isInside) {
                            setLoading(false)
                            setAlert({
                                open: true,
                                message: "You are not inside the geofenced area.",
                                type: "error"
                            });
                            return
                        } else {
                            handleClockIn(response?.data.result?.data?.employeeId, locationId, companyId)
                        }
                    }
                }
            } else {
                handleClockIn(response?.data.result?.data?.employeeId, locationId, companyId)
            }
        } else {
            if (response?.data?.message) {
                setAlert({ open: true, message: response.data.message, type: "error" });
            } else {
                setAlert({ open: true, message: "Login failed. Please try again.", type: "error" });
            }
        }
    };

    useEffect(() => {
        if (loginInfo?.companyId) {
            submit(loginInfo);
        }
    }, [loginInfo]);

    return (
        <div className='relative'>
            <FaceRegistration setLoginInfo={setLoginInfo} />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
    setLoading
};

export default connect(null, mapDispatchToProps)(LoginIOS)