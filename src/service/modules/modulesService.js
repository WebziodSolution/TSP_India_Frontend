import { companyModuleURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllModules = async () => {
    try {
        const response = axiosInterceptor().get(`${companyModuleURL}/getAllModules`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getModule = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyModuleURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const addModules = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyModuleURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateModules = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${companyModuleURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteModules = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyModuleURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}