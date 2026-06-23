import { googleMapAPIKey } from "../../config/apiConfig/apiConfig"

export const getLocationDetailsByCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapAPIKey}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error)
    }
}

export const searchLocationDetails = async (fullAddress) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${googleMapAPIKey}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error)
    }
}