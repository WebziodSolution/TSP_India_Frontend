import { companyShiftURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllShifts = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyShiftURL}/get/all/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getShift = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyShiftURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createShift = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyShiftURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateShift = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${companyShiftURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteShift = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyShiftURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}