import { companyThemeURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllCompanyTheme = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyThemeURL}/get/all/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getCompanyTheme = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyThemeURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createCompanyTheme = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyThemeURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateCompanyTheme = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${companyThemeURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteCompanyTheme = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyThemeURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}