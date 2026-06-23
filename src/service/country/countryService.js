import { countryURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllCountry = async () => {
    try {
        const response = axiosInterceptor().get(`${countryURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getCountry = async (id) => {
    try {
        const response = axiosInterceptor().get(`${countryURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}