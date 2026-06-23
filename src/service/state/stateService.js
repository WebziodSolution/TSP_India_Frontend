import { stateURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllState = async () => {
    try {
        const response = axiosInterceptor().get(`${stateURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllStateByCountry = async (id) => {
    try {
        const response = axiosInterceptor().get(`${stateURL}/getAllStateByCountry/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}