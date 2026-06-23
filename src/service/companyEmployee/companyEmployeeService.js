import { companyEmployeeURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllCompanyEmployee = async (companyId) => {
    try {
        const response = axiosInterceptor().get(`${companyEmployeeURL}/getAllCompanyEmployee/${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllEmployeeListByCompanyId = async (companyId) => {
    try {
        const response = axiosInterceptor().get(`${companyEmployeeURL}/getAllEmployeeListByCompanyId/${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getCompanyEmployee = async (id) => {
    try {
        const response = axiosInterceptor().get(`${companyEmployeeURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getEmployeePFReport = async (params) => {
    try {
        const response = axiosInterceptor().get(`${companyEmployeeURL}/getEmployeePFAndPTReport?${params}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createEmployee = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyEmployeeURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateEmployee = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${companyEmployeeURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteEmployee = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${companyEmployeeURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const uploadEmployeeImage = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyEmployeeURL}/uploadEmployeeProfile`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteEmployeeImage = async (companyId, employeeId) => {
    try {
        const response = axiosInterceptor().delete(`${companyEmployeeURL}/deleteEmployeeImage/${companyId}/${employeeId}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const uploadEmployeeAadharImage = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyEmployeeURL}/uploadEmployeeAadharImage`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteEmployeeAadharImage = async (companyId, employeeId) => {
    try {
        const response = axiosInterceptor().delete(`${companyEmployeeURL}/deleteEmployeeAadharImage/${companyId}/${employeeId}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const createEmployeeFromTSP = async (data) => {
    try {
        const response = axiosInterceptor().post(`${companyEmployeeURL}/createEmployee`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateEmployeeFromTSP = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${companyEmployeeURL}/updateEmployee/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getLastUserId = async () => {
    try {
        const response = axiosInterceptor().get(`${companyEmployeeURL}/getLastUserId`)
        return response
    } catch (error) {
        console.log(error)
    }
}