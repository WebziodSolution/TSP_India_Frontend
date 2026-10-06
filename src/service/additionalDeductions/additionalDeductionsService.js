import { additionalDeductionsURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const findByMonthAndUser = async (month, id) => {
    try {
        const response = await axiosInterceptor().get(`${additionalDeductionsURL}/get/all/${month}/${id}`)
        return response
    } catch (error) {
        console.log(error)
        return null
    }
}

export const saveAdditionalDeduction = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${additionalDeductionsURL}/save`, data)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const deleteAdditionalDeduction = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${additionalDeductionsURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}