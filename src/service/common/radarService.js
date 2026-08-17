import { radarAPIURL, radarSKAPIKey } from "../../config/apiConfig/apiConfig"
import { Geolocation } from '@capacitor/geolocation';
import { isNative } from "../../utils/platform";
// import { v4 as uuidv4 } from 'uuid';

//  const deviceId = localStorage.getItem('radarDeviceId') || (() => {
//             const id = uuidv4();
//             localStorage.setItem('radarDeviceId', id);
//             return id;
//         })();


export const createGeofences = async (payload) => {
    try {
        const response = await fetch(`${radarAPIURL}/geofences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: radarSKAPIKey,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Radar API error: ${response.status}`);
        }
        const res = await response.json();
        return res;
    } catch (error) {
        console.log('Geofence creation error:', error.response?.data || error);
    }
};

export const updateGeofences = async (id, payload) => {
    try {

        const response = await fetch(`${radarAPIURL}/geofences/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: radarSKAPIKey,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Radar API error: ${response.status}`);
        }
        const res = await response.json();
        return res;
    } catch (error) {
        console.log('Geofence update error:', error.response?.data || error);
    }
};

export const getGeofencesByExternalId = async (externalId) => {
    try {
        const response = await fetch(`${radarAPIURL}/geofences?externalId=${externalId}`, {
            method: 'GET',
            headers: {
                'Authorization': radarSKAPIKey,
            },
        });
        if (!response.ok) {
            throw new Error(`Radar API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Geofence fetch error:', error.message || error);
    }
};


export const deleteGeofence = async (id) => {
    try {
        const url = `${radarAPIURL}/geofences/${id}`;

        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: radarSKAPIKey
            },
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Radar API deletion failed (${res.status}): ${body}`);
        }
        return true;
    } catch (err) {
        console.error('❌ Deletion failed:', err.message);
        return false;
    }
};

export const getCurrentLocation = async () => {
    try {
        const locationResponse = await fetch(`${radarAPIURL}/geocode/ip`, {
            method: 'GET',
            headers: {
                'Authorization': radarSKAPIKey
            }
        })
        const locationData = await locationResponse.json();
        return locationData
    } catch (error) {
        console.log(error)
    }
}

export const requestLocationPermission = async () => {
    try {
        if (isNative()) {
            let permissions = await Geolocation.checkPermissions();

            if (
                permissions.location !== 'granted' &&
                permissions.coarseLocation !== 'granted'
            ) {
                permissions = await Geolocation.requestPermissions();
            }

            return permissions;
        }

        // Web: permission is requested automatically when getCurrentPosition()
        // or watchPosition() is called.
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({
                    location: 'denied',
                    error: 'GEOLOCATION_NOT_SUPPORTED'
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                () => {
                    resolve({ location: 'granted' });
                },
                (error) => {
                    resolve({
                        location: 'denied',
                        error: error.code
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });

    } catch (error) {
        console.error('Permission error:', error);

        return {
            location: 'denied',
            error: error?.message || 'LOCATION_PERMISSION_ERROR'
        };
    }
};

export const getAccurateLocation = async () => {
    try {
        if (isNative()) {
            let permissions = await Geolocation.checkPermissions();

            if (
                permissions.location !== 'granted' &&
                permissions.coarseLocation !== 'granted'
            ) {
                permissions = await Geolocation.requestPermissions();
            }

            // IMPORTANT:
            // For attendance, don't accept coarse-only location.
            if (permissions.location !== 'granted') {
                return {
                    error: 'PRECISE_LOCATION_REQUIRED',
                    message:
                        'Please allow Precise Location for accurate attendance.'
                };
            }

            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            });

            const {
                latitude,
                longitude,
                accuracy,
                altitude,
                heading,
                speed
            } = position.coords;

            return {
                latitude,
                longitude,
                accuracy,
                altitude,
                heading,
                speed,
                source: 'native'
            };
        }

        // WEB
        if (!navigator.geolocation) {
            return {
                error: 'GEOLOCATION_NOT_SUPPORTED',
                message: 'Geolocation is not supported by this browser.'
            };
        }

        return await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {
                        latitude,
                        longitude,
                        accuracy,
                        altitude,
                        heading,
                        speed
                    } = position.coords;

                    resolve({
                        latitude,
                        longitude,
                        accuracy,
                        altitude,
                        heading,
                        speed,
                        source: 'web'
                    });
                },
                (error) => {
                    console.error('Web geolocation error:', error);

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            resolve({
                                error: 'PERMISSION_DENIED',
                                message:
                                    'Location permission was denied. Please allow location access.'
                            });
                            break;

                        case error.POSITION_UNAVAILABLE:
                            resolve({
                                error: 'LOCATION_DISABLED',
                                message:
                                    'Location is unavailable. Please turn on GPS/location services.'
                            });
                            break;

                        case error.TIMEOUT:
                            resolve({
                                error: 'TIMEOUT',
                                message:
                                    'Unable to get an accurate location. Please try again.'
                            });
                            break;

                        default:
                            resolve({
                                error: 'UNKNOWN_ERROR',
                                message:
                                    error.message || 'Unable to get location.'
                            });
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });

    } catch (error) {
        console.error('Location error:', error);

        return {
            error: 'UNKNOWN_ERROR',
            message: error?.message || 'Could not retrieve location.'
        };
    }
};

// export const getAccurateLocation = async () => {
//     return new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const { latitude, longitude, accuracy, altitude } = position.coords;
//                 if (accuracy && accuracy <= 50) {
//                     resolve({ latitude, longitude, accuracy, source: "gps", altitude });
//                 } else {
//                     console.warn("Low GPS accuracy:", accuracy);
//                     resolve({ latitude, longitude, accuracy, source: "gps", altitude });
//                     // resolve(null);
//                 }
//             },
//             async () => {
//                 resolve(null); // Avoid fallback unless needed
//             },
//             { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//     });
// };