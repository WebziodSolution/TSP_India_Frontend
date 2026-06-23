import { salaryStatementHistoryURL } from "../../config/apiConfig/apiConfig"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllHistory = async (data) => {
    try {
        const response = axiosInterceptor().post(`${salaryStatementHistoryURL}/getAllHistory`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getHistory = async (id) => {
    try {
        const response = axiosInterceptor().get(`${salaryStatementHistoryURL}/getHistory/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}


export const addSalaryStatement = async (data) => {
    try {
        const response = axiosInterceptor().post(`${salaryStatementHistoryURL}/addHistory`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateSalaryStatement = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${salaryStatementHistoryURL}/updateHistory/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}