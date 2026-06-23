import { userInOutURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const getDashboardData = async (companyId) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/getDashboardData/${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const generateExcelReport = async (data) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/generateExcelReport?${data}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getTodayInOutRecords = async () => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/todayrecords`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllEntriesWithFilter = async (data) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/inoutreport?${data}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllEntriesByUserId = async (params) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/getAllRecords?${params}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getAllRecordsGroupByUser = async (params) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/getAllRecordsGroupByUser?${params}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getUserInOutRecord = async (id) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/get/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const getUserLastInOut = async (id) => {
    try {
        const response = axiosInterceptor().get(`${userInOutURL}/getUserLastInOut/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const addUserTimeIn = async (id, companyId) => {
    try {
        const response = axiosInterceptor().post(`${userInOutURL}/create?locationId=${id}&companyId=${companyId}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateUserTimeIn = async (id) => {
    try {
        const response = axiosInterceptor().put(`${userInOutURL}/update/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const updateUserTimeRecord = async (data) => {
    try {
        const response = axiosInterceptor().put(`${userInOutURL}/update`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const addClockInOut = async (data) => {
    try {
        const response = axiosInterceptor().post(`${userInOutURL}/addClockInOut`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const addUserTimeInPhone = async (params) => {
    try {
        const response = axiosInterceptor().post(`${userInOutURL}/clockInOut?${params}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteUserInOut = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${userInOutURL}/delete/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const addBulkClockInOut = async (data) => {
    try {
        const response = axiosInterceptor().post(`${userInOutURL}/addBulk`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}