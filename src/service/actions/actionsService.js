import { companyActionsURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllActions = async (data) => {
    try {
        const response = axiosInterceptor().get(`${companyActionsURL}/getAllActions`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

