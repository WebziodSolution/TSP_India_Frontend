import { employeeBankInfoURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"


export const createEmployeeBankInfo = async (data) => {
    try {
        const response = axiosInterceptor().post(`${employeeBankInfoURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getEmployeeBankInfo = async (id) => {
    try {
        const response = axiosInterceptor().get(`${employeeBankInfoURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateEmployeeBankInfo = async (id, data) => {
    try {
        const response = axiosInterceptor().put(`${employeeBankInfoURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const uploadPassbookImage = async (data) => {
    try {
        const response = axiosInterceptor().post(`${employeeBankInfoURL}/uploadPassbookImage`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deletePassbookImage = async (companyId, employeeId) => {
    try {
        const response = axiosInterceptor().delete(`${employeeBankInfoURL}/deletePassbookImage/${companyId}/${employeeId}`)
        return response
    } catch (error) {
        console.log(error)
    }
}
