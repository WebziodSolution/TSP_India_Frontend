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

export const getAccurateLocation = async () => {
    try {
        if (isNative()) {
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });

            const { latitude, longitude, accuracy, altitude } = position.coords;
            return { latitude, longitude, accuracy, source: 'capacitor', altitude };
        } else {
            // Web fallback
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude, accuracy, altitude } = position.coords;
                        resolve({ latitude, longitude, accuracy, source: 'web', altitude });
                    },
                    (error) => {
                        console.warn("Web geolocation error:", error);
                        resolve(null);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            });
        }
    } catch (err) {
        console.error("Location error:", err);
        return null;
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