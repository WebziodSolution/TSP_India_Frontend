import { companyDetailsURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const searchCompany = async (params) => {
    try {
        const response = axiosInterceptor().get(`${companyDetailsURL}/search?${params}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllCompanyDetails = async (params) => {
    try {
        const response = axiosInterceptor().get(`${companyDetailsURL}/get/all?active=${params}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getCompanyDetails = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyDetailsURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createCompanyDetails = async (data, step) => {
    try {
        const response = axiosInterceptor().post(`${companyDetailsURL}/create/${step}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateCompanyDetails = async (id, data, step) => {
    try {
        const response = axiosInterceptor().put(`${companyDetailsURL}/update/${id}/${step}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteCompanyDetails = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyDetailsURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const uploadCompanyLogo = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyDetailsURL}/uploadCompanyLogo`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteCompanyLogo = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyDetailsURL}/deleteCompanyLogo/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getLastCompanyDetails = async () => {
    try {
        const response = axiosInterceptor().get(`${companyDetailsURL}/getLastCompany`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getAutoTimeInAfterHours = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyDetailsURL}/getAutoTimeInAfterHours/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateAutoTimeInAfterHours = async (id, data) => {
    try {
        const response = axiosInterceptor().post(`${companyDetailsURL}/updateAutoTimeInAfterHours/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}