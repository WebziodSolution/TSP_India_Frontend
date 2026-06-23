import { employeeTypeURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllEmployeeType = async () => {
    try {
        const response = axiosInterceptor().get(`${employeeTypeURL}/get/All`)
        return response

    } catch (error) {
        console.log(error)
    }
}