import { employmentInfoURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const createEmploymentInfo = async (data) => {
    try {
        const response = axiosInterceptor().post(`${employmentInfoURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getEmploymentInfo = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employmentInfoURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateEmploymentInfo = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${employmentInfoURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}