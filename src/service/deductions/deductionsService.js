import { deductionsURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllDeductions = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${deductionsURL}/get/all?id=${id}`);
        return response;
    } catch (error) {
        console.error(error);
        throw error;   // optionally rethrow so the caller can handle it
    }
}

export const getDeductionById = async (id) => {
    try {
        const response = axiosInterceptor().get(`${deductionsURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createDeduction = async (data) => {
    try {
        const response = axiosInterceptor().post(`${deductionsURL}/save`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteDeduction = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${deductionsURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}