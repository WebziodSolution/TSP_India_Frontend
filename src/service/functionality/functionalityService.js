import { companyFunctionalityURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllFunctionality = async () => {
    try {
        const response = axiosInterceptor().get(`${companyFunctionalityURL}/getAllFunctionality`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getFunctionality = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyFunctionalityURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const addFunctionality = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyFunctionalityURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateFunctionality = async (id,data) => {
    try {
        const response = axiosInterceptor().put(`${companyFunctionalityURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteFunctionality = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyFunctionalityURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}