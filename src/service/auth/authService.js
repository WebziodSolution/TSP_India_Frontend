import { userURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const login = async (data) => {
    try {
        const response = axiosInterceptor().post(`${userURL}/login`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}